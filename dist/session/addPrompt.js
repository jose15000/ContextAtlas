export function addPrompt(graph, prompt) {
    const id = crypto.randomUUID();
    graph.addNode({
        id,
        type: "user_prompt",
        data: { prompt }
    });
    return id;
}
