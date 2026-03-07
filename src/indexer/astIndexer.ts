import { Project, SyntaxKind, Node as TsMorphNode } from "ts-morph";
import { Graph } from "../graph/Graph.js";
import { Node } from "../../types/Node.js";


export function buildContextGraph(dir: string): Graph {
    const graph = new Graph();

    const project = new Project({
        tsConfigFilePath: `${dir}/tsconfig.json`,
        skipAddingFilesFromTsConfig: false,
    });

    const typeChecker = project.getTypeChecker();

    if (project.getSourceFiles().length === 0) {
        project.addSourceFilesAtPaths(`${dir}/**/*.ts`);
    }

    const sourceFiles = project.getSourceFiles();

    for (const sourceFile of sourceFiles) {
        const filePath = sourceFile.getFilePath();
        const fileNode: Node = {
            id: filePath,
            type: "file",
            data: { path: filePath, name: sourceFile.getBaseName() }
        };
        graph.addNode(fileNode);

        const classes = sourceFile.getClasses();
        for (const cls of classes) {
            const className = cls.getName();
            if (!className) continue;

            const classId = `${filePath}#${className}`;
            graph.addNode({
                id: classId,
                type: "class",
                data: { name: className }
            });

            graph.addEdge({
                from: filePath,
                to: classId,
                type: "DEFINES"
            });

            const implementsNodes = cls.getImplements();
            for (const impl of implementsNodes) {
                const exprType = impl.getExpression().getText();
                const implId = `${exprType}`;
                graph.addEdge({
                    from: classId,
                    to: implId,
                    type: "IMPLEMENTS"
                });
            }
        }

        // 2. Extract Interfaces
        const interfaces = sourceFile.getInterfaces();
        for (const iface of interfaces) {
            const ifaceName = iface.getName();
            if (!ifaceName) continue;

            const ifaceId = `${filePath}#${ifaceName}`;
            graph.addNode({
                id: ifaceId,
                type: "interface",
                data: { name: ifaceName }
            });

            // Add DEFINES edge: File -> Interface
            graph.addEdge({
                from: filePath,
                to: ifaceId,
                type: "DEFINES"
            });
        }

        // 3. Extract Functions
        const functions = sourceFile.getFunctions();
        for (const fn of functions) {
            const fnName = fn.getName();
            if (!fnName) continue;

            const fnId = `${filePath}#${fnName}`;
            graph.addNode({
                id: fnId,
                type: "function",
                data: { name: fnName }
            });

            // Add DEFINES edge: File -> Function
            // Add DEFINES edge: File -> Function
            graph.addEdge({
                from: filePath,
                to: fnId,
                type: "DEFINES"
            });

            // Extract CALLS edges by traversing the function body
            const callExpressions = fn.getDescendantsOfKind(SyntaxKind.CallExpression);
            for (const callExpr of callExpressions) {
                const expr = callExpr.getExpression();
                const symbol = typeChecker.getSymbolAtLocation(expr);

                if (symbol) {
                    const valueDec = symbol.getValueDeclaration();
                    if (valueDec) {
                        const targetFile = valueDec.getSourceFile().getFilePath();
                        const targetSymbolName = symbol.getName();

                        // We assume the target ID format is `filePath#symbolName`
                        const targetId = `${targetFile}#${targetSymbolName}`;

                        graph.addEdge({
                            from: fnId,
                            to: targetId,
                            type: "CALLS"
                        });
                    }
                }
            }
        }


        // 4. Extract Imports (IMPORTS edges)
        const imports = sourceFile.getImportDeclarations();
        for (const imp of imports) {
            const moduleSpecifier = imp.getModuleSpecifierValue();
            const sourceFileNode = imp.getModuleSpecifierSourceFile();

            let targetId = moduleSpecifier;
            if (sourceFileNode) {
                targetId = sourceFileNode.getFilePath();
            }

            graph.addEdge({
                from: filePath,
                to: targetId,
                type: "IMPORTS"
            });
        }
    }

    return graph;
}
