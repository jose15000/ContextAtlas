import { Graph } from "../../core/graph/Graph.js";
import { Node } from "../../core/graph/models/Node.js";

export function searchSymbol(graph: Graph, query: string) {
    const lowerQuery = query.toLowerCase();

    const matches = Array.from(graph.nodes.values()).filter(n => {
        const name = n.data?.name || n.id;
        return name.toLowerCase().includes(lowerQuery);
    });

    return matches.slice(0, 50);
}
