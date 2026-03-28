import { Graph } from "../../core/graph/Graph.js";
import { expandNode } from "../../services/graph/expandNode.js";
import { Edge } from "../../core/graph/models/Edge.js";

export const GraphHandlers = {
    handleExpandNode: async (graph: Graph, nodeId: string, depth: number) => {
        try {
            const { nodes, edges } = expandNode(graph, nodeId, depth);

            const nodesText = nodes.map(n =>
                `[${n.type}] ${n.data?.name ?? n.id} (${n.id})`
            ).join("\n");

            const edgesText = edges.map((e: Edge) =>
                `${e.from.split("#").pop()} --[${e.type}]--> ${e.to.split("#").pop()}`
            ).join("\n");

            const output = `=== Nodes (${nodes.length}) ===\n${nodesText}\n\n=== Edges (${edges.length}) ===\n${edgesText}`;
            return { content: [{ type: "text" as const, text: output }] };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: error.message }],
                isError: true
            };
        }
    }
};
