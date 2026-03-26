export function getBugsByFile(graph, file) {
    const matches = Array.from(graph.nodes.values()).filter(n => n.data?.file?.includes(file) && n.data?.reasoning?.thoughtDetails === "bug");
    if (matches.length === 0) {
        return { content: [{ type: "text", text: `No bugs found in '${file}'.` }] };
    }
    const lines = matches.map(n => {
        return `Bug in ${n.data?.file}:\nThought: ${n.data?.reasoning?.thoughtDescription}\nSolution: ${n.data?.reasoning?.solution}`;
    });
    return { content: [{ type: "text", text: lines.join("\n\n") }] };
}
