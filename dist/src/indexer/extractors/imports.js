export function indexImports(sourceFile, graph) {
    const filePath = sourceFile.getFilePath();
    for (const imp of sourceFile.getImportDeclarations()) {
        const resolvedFile = imp.getModuleSpecifierSourceFile();
        const targetId = resolvedFile
            ? resolvedFile.getFilePath()
            : imp.getModuleSpecifierValue();
        graph.addEdge({ from: filePath, to: targetId, type: "IMPORTS" });
    }
}
