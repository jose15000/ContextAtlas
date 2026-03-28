import { Graph } from "../../core/graph/Graph.js";
import { Node } from "../../core/graph/models/Node.js";

export function traceCallees(graph: Graph, nodeId: string) {
    const callees = graph.edges.filter(e => e.type === "CALLS" && e.from === nodeId);
    const calleeIds = Array.from(new Set(callees.map(e => e.to)));

    return calleeIds.map(id => graph.nodes.get(id)!).filter(Boolean);
}
