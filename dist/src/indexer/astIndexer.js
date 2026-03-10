import { Project } from "ts-morph";
import { Graph } from "../graph/Graph.js";
import { indexClasses } from "./extractors/classes.js";
import { indexFunctions } from "./extractors/functions.js";
import { indexInterfaces } from "./extractors/interfaces.js";
import { indexImports } from "./extractors/imports.js";
const EXCLUDED_DIRS = ["node_modules", "dist", ".next", ".cache"];
const isProjectFile = (dir) => (fp) => fp.startsWith(dir) &&
    !EXCLUDED_DIRS.some(d => fp.includes(`/${d}/`)) &&
    !fp.endsWith(".d.ts");
export function buildContextGraph(dir) {
    const graph = new Graph();
    const project = new Project({
        tsConfigFilePath: `${dir}/tsconfig.json`,
        skipAddingFilesFromTsConfig: false,
    });
    if (project.getSourceFiles().length === 0) {
        project.addSourceFilesAtPaths(`${dir}/**/*.ts`);
    }
    const inProject = isProjectFile(dir);
    const typeChecker = project.getTypeChecker();
    const sourceFiles = project.getSourceFiles().filter(sf => inProject(sf.getFilePath()));
    for (const sourceFile of sourceFiles) {
        const filePath = sourceFile.getFilePath();
        graph.addNode({
            id: filePath,
            type: "file",
            data: { path: filePath, name: sourceFile.getBaseName() }
        });
        indexClasses(sourceFile, graph, typeChecker, inProject);
        indexInterfaces(sourceFile, graph);
        indexFunctions(sourceFile, graph, typeChecker, inProject);
        indexImports(sourceFile, graph);
    }
    return graph;
}
