import { Graph } from "../../core/graph/Graph.js";
import { addReasoning, saveReasoningGraph } from "../../graph/reasoning/reasoningGraph.js";
import { SaveReasoningRequestDTO } from "../../core/dtos/reasoning.dto.js";

export async function saveReasoning(reasoningGraph: Graph, reasoning: SaveReasoningRequestDTO) {
    await addReasoning(reasoningGraph, { reasoning });
    saveReasoningGraph(reasoningGraph);
    return { size: reasoningGraph.nodes.size };
}
