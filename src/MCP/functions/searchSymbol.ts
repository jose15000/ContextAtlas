import { Graph } from "../../graph/Graph.js";

export function searchSymbol(graph: Graph, query: string) {
    const lowerQuery = query.toLowerCase();

    const matches = Array.from(graph.nodes.values()).filter(n => {
        const name = n.data?.name || n.id;
        return name.toLowerCase().includes(lowerQuery);
    });

    const output = matches.slice(0, 50).map(n =>
        `${n.data?.name || "Unnamed"} (${n.type}) — ${n.id}`
    ).join("\n");

    return { content: [{ type: "text" as const, text: output || "No symbols matched the query." }] };
}
