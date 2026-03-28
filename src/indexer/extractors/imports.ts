import { SourceFile } from "ts-morph";
import { Graph } from "../../core/graph/Graph.js";

export function indexImports(sourceFile: SourceFile, graph: Graph) {
    const filePath = sourceFile.getFilePath();

    for (const imp of sourceFile.getImportDeclarations()) {
        const resolvedFile = imp.getModuleSpecifierSourceFile();
        const targetId = resolvedFile
            ? resolvedFile.getFilePath()
            : imp.getModuleSpecifierValue();

        graph.addEdge({ from: filePath, to: targetId, type: "IMPORTS" });
    }
}
