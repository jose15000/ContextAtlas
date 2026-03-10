import { Graph } from "../src/graph/Graph";

export function addPrompt(graph: Graph, prompt: string) {
    const id = crypto.randomUUID()
    graph.addNode(
        {
            id,
            type: "user_prompt",
            data: { prompt }
        }
    )

    return id;
}