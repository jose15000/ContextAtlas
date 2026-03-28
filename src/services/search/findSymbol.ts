import { Graph } from "../../core/graph/Graph.js";
import { Node } from "../../core/graph/models/Node.js";

export function findSymbol(graph: Graph, symbol: string) {
    const lower = symbol.toLowerCase();
    const matches = Array.from(graph.nodes.values()).filter(n => {
        const name: string = n.data?.name || n.id;
        return name.toLowerCase().includes(lower);
    });

    return matches.slice(0, 50);
}
