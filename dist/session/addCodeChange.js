export function addCodeChange(graph, change, thoughtId) {
    const id = crypto.randomUUID();
    graph.addNode({
        id,
        type: "code_change",
        data: { change }
    });
    graph.addEdge({
        from: thoughtId,
        to: id,
        type: "MODIFIES"
    });
    return id;
}
