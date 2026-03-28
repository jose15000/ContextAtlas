import { Graph } from "../graph/Graph.js";

export function traceCallees(graph: Graph, nodeId: string) {
    const callees = graph.edges.filter(e => e.type === "CALLS" && e.from === nodeId);
    const calleeIds = Array.from(new Set(callees.map(e => e.to)));

    if (calleeIds.length === 0) {
        return { content: [{ type: "text" as const, text: "No callees found." }] };
    }

    const lines = calleeIds.map(id => {
        const n = graph.nodes.get(id);
        return `  - ${n?.data?.name ?? id} [${n?.type ?? "?"}] (${id})`;
    });

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
}
