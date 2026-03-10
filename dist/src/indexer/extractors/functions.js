import { SyntaxKind } from "ts-morph";
export function indexFunctions(sourceFile, graph, typeChecker, isProjectFile) {
    const filePath = sourceFile.getFilePath();
    for (const fn of sourceFile.getFunctions()) {
        const fnName = fn.getName();
        if (!fnName)
            continue;
        const fnId = `${filePath}#${fnName}`;
        graph.addNode({ id: fnId, type: "function", data: { name: fnName } });
        graph.addEdge({ from: filePath, to: fnId, type: "DEFINES" });
        for (const callExpr of fn.getDescendantsOfKind(SyntaxKind.CallExpression)) {
            const symbol = typeChecker.getSymbolAtLocation(callExpr.getExpression());
            const valueDec = symbol?.getValueDeclaration();
            if (!valueDec)
                continue;
            const targetFile = valueDec.getSourceFile().getFilePath();
            if (!isProjectFile(targetFile))
                continue;
            graph.addEdge({
                from: fnId,
                to: `${targetFile}#${symbol.getName()}`,
                type: "CALLS"
            });
        }
    }
}
