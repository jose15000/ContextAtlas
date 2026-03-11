export function findSymbol(graph, symbol) {
    const lower = symbol.toLowerCase();
    const matches = Array.from(graph.nodes.values()).filter(n => {
        const name = n.data?.name || n.id;
        return name.toLowerCase().includes(lower);
    });
    if (matches.length === 0) {
        return { content: [{ type: "text", text: `No symbols found matching '${symbol}'.` }] };
    }
    const lines = matches.slice(0, 50).map(n => {
        const file = n.id.split("#")[0];
        return `[${n.type}] ${n.data?.name ?? n.id}\n  id:   ${n.id}\n  file: ${file}`;
    });
    return { content: [{ type: "text", text: lines.join("\n\n") }] };
}
