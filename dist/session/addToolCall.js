export function addToolCall(graph, tool, thoughtId) {
    const id = crypto.randomUUID();
    graph.addNode({
        id,
        type: "tool_call",
        data: { tool }
    });
    graph.addEdge({
        from: thoughtId,
        to: id,
        type: "CALLS_TOOL"
    });
    return id;
}
