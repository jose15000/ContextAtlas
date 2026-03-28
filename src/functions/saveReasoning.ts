import { Graph } from "../graph/Graph.js";
import { addReasoning, saveReasoningGraph } from "../graph/reasoning/reasoningGraph.js";
import { IReasoning } from "../types/Reasoning.js";

export async function saveReasoning(reasoningGraph: Graph, reasoning: IReasoning) {
    await addReasoning(reasoningGraph, { reasoning });
    saveReasoningGraph(reasoningGraph);

    return {
        content: [{
            type: "text" as const,
            text: `Reasoning saved (${reasoningGraph.nodes.size} total entries in memory).`
        }]
    };
}
