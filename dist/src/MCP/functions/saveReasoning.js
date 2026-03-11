import { addReasoning, getReasoningGraph } from "../../graph/reasoning/reasoningGraph.js";
export function saveReasoning(prompt, thought, solution) {
    addReasoning(prompt, thought, solution);
    const graph = getReasoningGraph();
    const serialized = {
        nodes: Array.from(graph.nodes.values()),
        edges: graph.edges,
    };
    return { content: [{ type: "text", text: JSON.stringify(serialized, null, 2) }] };
}
