import { SyntaxKind } from "ts-morph";
export function indexClasses(sourceFile, graph, typeChecker, isProjectFile) {
    const filePath = sourceFile.getFilePath();
    for (const cls of sourceFile.getClasses()) {
        const className = cls.getName();
        if (!className)
            continue;
        const classId = `${filePath}#${className}`;
        graph.addNode({ id: classId, type: "class", data: { name: className } });
        graph.addEdge({ from: filePath, to: classId, type: "DEFINES" });
        for (const impl of cls.getImplements()) {
            graph.addEdge({
                from: classId,
                to: impl.getExpression().getText(),
                type: "IMPLEMENTS"
            });
        }
        for (const method of cls.getMethods()) {
            const methodName = method.getName();
            if (!methodName)
                continue;
            const methodId = `${filePath}#${className}.${methodName}`;
            graph.addNode({
                id: methodId,
                type: "method",
                data: { name: `${className}.${methodName}`, className, methodName }
            });
            graph.addEdge({ from: classId, to: methodId, type: "DEFINES" });
            for (const callExpr of method.getDescendantsOfKind(SyntaxKind.CallExpression)) {
                const symbol = typeChecker.getSymbolAtLocation(callExpr.getExpression());
                const valueDec = symbol?.getValueDeclaration();
                if (!valueDec)
                    continue;
                const targetFile = valueDec.getSourceFile().getFilePath();
                if (!isProjectFile(targetFile))
                    continue;
                graph.addEdge({
                    from: methodId,
                    to: `${targetFile}#${symbol.getName()}`,
                    type: "CALLS"
                });
            }
        }
    }
}
