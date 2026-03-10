export function addThought(graph, promptId, thought) {
    const id = crypto.randomUUID();
    graph.addNode({
        id,
        type: "agent_thought",
        data: { thought }
    });
    graph.addEdge({
        from: promptId,
        to: id,
        type: "THINKS"
    });
    return id;
}
