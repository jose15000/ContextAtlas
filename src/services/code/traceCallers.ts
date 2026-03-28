import { Graph } from "../../core/graph/Graph.js";
import { Node } from "../../core/graph/models/Node.js";

export interface TraceResult {
    target: Node;
    callers: Node[];
}

export function traceCallers(graph: Graph, functionName: string) {
    const targetNodes = Array.from(graph.nodes.values()).filter(n =>
        (n.type === "function" || n.type === "method") && n.data.name === functionName
    );

    if (targetNodes.length === 0) {
        throw new Error(`Symbol '${functionName}' not found in the graph.`);
    }

    const results: TraceResult[] = targetNodes.map(targetNode => {
        const callersEdges = graph.edges.filter(e => e.type === "CALLS" && e.to === targetNode.id);
        const callerIds = Array.from(new Set(callersEdges.map(e => e.from)));
        const callers = callerIds.map(id => graph.nodes.get(id)!).filter(Boolean);
        return { target: targetNode, callers };
    });

    return results;
}
