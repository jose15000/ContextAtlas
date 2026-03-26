import { Project } from "ts-morph";
import { Graph } from "../graph/Graph.js";
import { indexClasses } from "./extractors/classes.js";
import { indexFunctions } from "./extractors/functions.js";
import { indexInterfaces } from "./extractors/interfaces.js";
import { indexImports } from "./extractors/imports.js";
import { EmbedQuery } from "../MCP/functions/embedQuery.js";

const EXCLUDED_DIRS = ["node_modules", "dist", ".next", ".cache"];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const EXCLUDED_PATTERNS = [
    /\.test\.[tj]sx?$/,   // *.test.ts, *.test.tsx, *.test.js
    /\.spec\.[tj]sx?$/,   // *.spec.ts, *.spec.tsx
    /\/test-[^/]+\.[tj]sx?$/, // test-*.ts at any level
];

const isProjectFile = (dir: string) => (fp: string) =>
    fp.startsWith(dir) &&
    !EXCLUDED_DIRS.some(d => fp.includes(`/${d}/`)) &&
    !fp.endsWith(".d.ts") &&
    SOURCE_EXTENSIONS.some(ext => fp.endsWith(ext)) &&
    !EXCLUDED_PATTERNS.some(pat => pat.test(fp));


export async function buildContextGraph(dir: string): Promise<Graph> {
    const graph = new Graph();

    const project = new Project({
        tsConfigFilePath: `${dir}/tsconfig.json`,
        skipAddingFilesFromTsConfig: false,
    });

    if (project.getSourceFiles().length === 0) {
        project.addSourceFilesAtPaths([
            `${dir}/**/*.ts`,
            `${dir}/**/*.tsx`,
            `${dir}/**/*.js`,
            `${dir}/**/*.jsx`,
        ]);
    }

    const inProject = isProjectFile(dir);
    const typeChecker = project.getTypeChecker();
    const sourceFiles = project.getSourceFiles().filter(sf => inProject(sf.getFilePath()));

    for (const sourceFile of sourceFiles) {
        const filePath = sourceFile.getFilePath();
        const fileContentContext = `File: ${filePath}. Classes: ${sourceFile.getClasses().map(c => c.getName()).join(', ')}. Functions: ${sourceFile.getFunctions().map(f => f.getName()).join(', ')}.`;
        const embedding = await EmbedQuery(fileContentContext);
        graph.addNode({
            graphType: "Code",
            id: filePath,
            type: "file",
            data: {
                path: filePath, name: sourceFile.getBaseName(), embedding: embedding

            }
        });

        indexClasses(sourceFile, graph, typeChecker, inProject);
        indexInterfaces(sourceFile, graph);
        indexFunctions(sourceFile, graph, typeChecker, inProject);
        indexImports(sourceFile, graph);
    }

    return graph;
}
