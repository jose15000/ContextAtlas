import { addReasoning, saveReasoningGraph } from "../../graph/reasoning/reasoningGraph.js";
export async function saveReasoning(reasoningGraph, reasoning) {
    await addReasoning(reasoningGraph, { reasoning });
    saveReasoningGraph(reasoningGraph);
    return {
        content: [{
                type: "text",
                text: `Reasoning saved (${reasoningGraph.nodes.size} total entries in memory).`
            }]
    };
}
