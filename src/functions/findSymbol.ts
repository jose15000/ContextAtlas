import { Graph } from "../graph/Graph.js";

export function findSymbol(graph: Graph, symbol: string) {
    const lower = symbol.toLowerCase();
    const matches = Array.from(graph.nodes.values()).filter(n => {
        const name: string = n.data?.name || n.id;
        return name.toLowerCase().includes(lower);
    });

    if (matches.length === 0) {
        return { content: [{ type: "text" as const, text: `No symbols found matching '${symbol}'.` }] };
    }

    const lines = matches.slice(0, 50).map(n => {
        const file = n.id.split("#")[0];
        return `[${n.type}] ${n.data?.name ?? n.id}\n  id:   ${n.id}\n  file: ${file}`;
    });

    return { content: [{ type: "text" as const, text: lines.join("\n\n") }] };
}
