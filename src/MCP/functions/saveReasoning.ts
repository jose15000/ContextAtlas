import { addReasoning, getReasoningGraph } from "../../graph/reasoning/reasoningGraph.js";

export function saveReasoning(prompt: string, thought: string, solution: string) {
    addReasoning(prompt, thought, solution);
    const graph = getReasoningGraph();

    const serialized = {
        nodes: Array.from(graph.nodes.values()),
        edges: graph.edges,
    };

    return { content: [{ type: "text" as const, text: JSON.stringify(serialized, null, 2) }] };
}
