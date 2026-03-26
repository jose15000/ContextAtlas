import { SourceFile, TypeChecker, SyntaxKind } from "ts-morph";
import { Graph } from "../../graph/Graph.js";
import { EmbedQuery } from "../../MCP/functions/embedQuery.js";

export async function indexFunctions(
    sourceFile: SourceFile,
    graph: Graph,
    typeChecker: TypeChecker,
    isProjectFile: (fp: string) => boolean
) {
    const filePath = sourceFile.getFilePath();

    for (const fn of sourceFile.getFunctions()) {
        const fnName = fn.getName();
        if (!fnName) continue;

        const params = fn.getParameters().map(p => p.getText()).join(', ');
        const returnType = fn.getReturnTypeNode()?.getText() || 'void';
        const jsDoc = fn.getJsDocs()[0]?.getInnerText() || '';
        const contextoFuncao = `Function ${fnName}(${params}): ${returnType}. ${jsDoc}`;
        const embed = await EmbedQuery(contextoFuncao);

        const fnId = `${filePath}#${fnName}`;
        graph.addNode({ graphType: "Code", id: fnId, type: "function", data: { name: fnName, embedding: embed } });
        graph.addEdge({ from: filePath, to: fnId, type: "DEFINES" });

        for (const callExpr of fn.getDescendantsOfKind(SyntaxKind.CallExpression)) {
            const symbol = typeChecker.getSymbolAtLocation(callExpr.getExpression());
            const valueDec = symbol?.getValueDeclaration();
            if (!valueDec) continue;

            const targetFile = valueDec.getSourceFile().getFilePath();
            if (!isProjectFile(targetFile)) continue;

            graph.addEdge({
                from: fnId,
                to: `${targetFile}#${symbol!.getName()}`,
                type: "CALLS"
            });
        }
    }
}
