import { SyntaxKind } from "ts-morph";
import { EmbedQuery } from "../../MCP/functions/embedQuery.js";
export async function indexClasses(sourceFile, graph, typeChecker, isProjectFile) {
    const filePath = sourceFile.getFilePath();
    for (const cls of sourceFile.getClasses()) {
        const className = cls.getName();
        const contextoClasse = `Class ${className} ${cls.getExtends() ? `extends ${cls.getExtends()}` : ''}. Methods: ${cls.getMethods().map(m => m.getName()).join(', ')}`;
        const embedding = await EmbedQuery(contextoClasse);
        if (!className)
            continue;
        const classId = `${filePath}#${className}`;
        graph.addNode({ graphType: "Code", id: classId, type: "class", data: { name: className, embedding: embedding } });
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
            const params = method.getParameters().map(p => p.getText()).join(', ');
            const returnType = method.getReturnTypeNode()?.getText() || 'void';
            const jsDoc = method.getJsDocs()[0]?.getInnerText() || '';
            const contextoMetodo = `Method ${className}.${methodName}(${params}): ${returnType}. ${jsDoc}`;
            const embedding = await EmbedQuery(contextoMetodo);
            const methodId = `${filePath}#${className}.${methodName}`;
            graph.addNode({
                graphType: "Code",
                id: methodId,
                type: "method",
                data: { name: `${className}.${methodName}`, className, methodName, embedding }
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
