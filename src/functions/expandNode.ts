import { Graph } from "../graph/Graph.js";
import { expandGraph } from "../expansion/expandGraph.js";

export function expandNode(graph: Graph, nodeId: string, depth: number) {
    if (!graph.nodes.has(nodeId)) {
        return {
            content: [{ type: "text" as const, text: `Node '${nodeId}' not found in the graph.` }],
            isError: true
        };
    }

    const { nodes, edges } = expandGraph(graph, nodeId, depth, true);

    const nodesText = nodes.map(n =>
        `[${n.type}] ${n.data?.name ?? n.id} (${n.id})`
    ).join("\n");

    const edgesText = edges.map(e =>
        `${e.from.split("#").pop()} --[${e.type}]--> ${e.to.split("#").pop()}`
    ).join("\n");

    const output = `=== Nodes (${nodes.length}) ===\n${nodesText}\n\n=== Edges (${edges.length}) ===\n${edgesText}`;
    return { content: [{ type: "text" as const, text: output }] };
}
