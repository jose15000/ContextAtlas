import { Graph } from "../src/graph/Graph";

export function addPrompt(graph: Graph, prompt: string) {
    const id = "prompt_" + Date.now();
    graph.addNode(
        {
            id,
            type: "user_prompt",
            data: { prompt }
        }
    )

    return id;
}