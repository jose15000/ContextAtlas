import { Project } from "ts-morph";
import { Graph } from "../core/graph/Graph.js";
import { indexClasses } from "./extractors/classes.js";
import { indexFunctions } from "./extractors/functions.js";
import { indexInterfaces } from "./extractors/interfaces.js";
import { indexImports } from "./extractors/imports.js";
import { indexExportedObjects } from "./extractors/exportedObjects.js";
const EXCLUDED_DIRS = ["node_modules", "dist", ".next", ".cache"];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const EXCLUDED_PATTERNS = [
    /\.test\.[tj]sx?$/, // *.test.ts, *.test.tsx, *.test.js
    /\.spec\.[tj]sx?$/, // *.spec.ts, *.spec.tsx
    /\/test-[^/]+\.[tj]sx?$/, // test-*.ts at any level
];
const isProjectFile = (dir) => (fp) => fp.startsWith(dir) &&
    !EXCLUDED_DIRS.some(d => fp.includes(`/${d}/`)) &&
    !fp.endsWith(".d.ts") &&
    SOURCE_EXTENSIONS.some(ext => fp.endsWith(ext)) &&
    !EXCLUDED_PATTERNS.some(pat => pat.test(fp));
export async function buildContextGraph(dir) {
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
        await indexSourceFile(sourceFile, graph, typeChecker, inProject);
    }
    return graph;
}
async function indexSourceFile(sourceFile, graph, typeChecker, inProject) {
    const filePath = sourceFile.getFilePath();
    graph.addNode({
        graphType: "Code",
        id: filePath,
        type: "file",
        data: {
            path: filePath, name: sourceFile.getBaseName()
        }
    });
    await indexClasses(sourceFile, graph, typeChecker, inProject);
    indexInterfaces(sourceFile, graph);
    await indexFunctions(sourceFile, graph, typeChecker, inProject);
    await indexExportedObjects(sourceFile, graph, typeChecker, inProject);
    indexImports(sourceFile, graph);
}
export async function reindexFiles(graph, dir, filesToUpdate) {
    if (filesToUpdate.length === 0)
        return;
    const project = new Project({
        tsConfigFilePath: `${dir}/tsconfig.json`,
        skipAddingFilesFromTsConfig: false,
    });
    const inProject = isProjectFile(dir);
    const typeChecker = project.getTypeChecker();
    // As ts-morph might not autoload properly if tsconfig scope is weird, we forcefully add them
    project.addSourceFilesAtPaths(filesToUpdate);
    const sourceFiles = project.getSourceFiles().filter(sf => {
        const fp = sf.getFilePath();
        return filesToUpdate.includes(fp) && inProject(fp);
    });
    for (const sourceFile of sourceFiles) {
        await indexSourceFile(sourceFile, graph, typeChecker, inProject);
    }
}
