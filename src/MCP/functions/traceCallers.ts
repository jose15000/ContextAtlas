import { Graph } from "../../graph/Graph.js";

export function traceCallers(graph: Graph, functionName: string) {
    const targetNodes = Array.from(graph.nodes.values()).filter(n =>
        (n.type === "function" || n.type === "method") && n.data.name === functionName
    );

    if (targetNodes.length === 0) {
        return {
            content: [{ type: "text" as const, text: `Symbol '${functionName}' not found in the graph.` }],
            isError: true
        };
    }

    const results = targetNodes.map(targetNode => {
        const callers = graph.edges.filter(e => e.type === "CALLS" && e.to === targetNode.id);
        const callerIds = Array.from(new Set(callers.map(e => e.from)));
        const lines = callerIds.map(id => {
            const n = graph.nodes.get(id);
            return `  - ${n?.data?.name ?? id} [${n?.type ?? "?"}] (${id})`;
        });
        return `${targetNode.id}:\n${lines.length ? lines.join("\n") : "  (no callers found)"}`;
    });

    return { content: [{ type: "text" as const, text: results.join("\n\n") }] };
}
