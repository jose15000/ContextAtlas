import path from "path";
import { Graph } from "../../core/graph/Graph.js";
import { saveGraph, loadGraph } from "../persistence.js";
import { NodeData } from "../../core/graph/models/NodeData.js";
import { EmbedQuery } from "../../core/indexer/embedQuery.js";

const REASONING_CACHE = "./context/.codeatlas-reasoning.json";

export function loadReasoningGraph(): Graph {
    const cachePath = path.join(process.cwd(), REASONING_CACHE);
    return loadGraph(cachePath) ?? new Graph();
}

export function saveReasoningGraph(graph: Graph): void {
    const cachePath = path.join(process.cwd(), REASONING_CACHE);
    saveGraph(graph, cachePath);
}


export async function addReasoning(graph: Graph, data: NodeData): Promise<void> {
    if (!data.reasoning) return;

    const {
        prompt,
        thoughtDescription,
        thoughtDetails,
        solution,
        agent,
        project,
        model,
        run_id,
        toolCall
    } = data.reasoning;

    const timestamp = new Date();
    const promptId = crypto.randomUUID();
    graph.addNode({
        graphType: "Reasoning",
        id: promptId,
        type: "user_prompt",
        data: { text: prompt, timestamp }
    });

    const thoughtId = crypto.randomUUID();
    const embed = await EmbedQuery(`${thoughtDescription} [${thoughtDetails}]`);
    graph.addNode({
        graphType: "Reasoning",
        id: thoughtId,
        type: "agent_thought",
        data: { text: thoughtDescription, timestamp, description: thoughtDetails, embedding: embed }
    });

    const toolId = crypto.randomUUID();
    graph.addNode({
        graphType: "Reasoning",
        id: toolId,
        type: "tool_call",
        data: { toolCall }
    });

    const solutionId = crypto.randomUUID();
    graph.addNode({
        graphType: "Reasoning",
        id: solutionId,
        type: "implementation",
        data: { text: solution, timestamp },
        metadata: { agent, project, model, run_id }
    });

    graph.addEdge({ from: promptId, to: thoughtId, type: "THINKS" });
    graph.addEdge({ from: thoughtId, to: solutionId, type: "GENERATED_BY" });
}
