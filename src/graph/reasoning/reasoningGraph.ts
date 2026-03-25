import path from "path";
import { Graph } from "../Graph.js";
import { saveGraph, loadGraph } from "../persistence.js";
import { NodeData } from "../../types/NodeData.js";

const REASONING_CACHE = "./context/.codeatlas-data.reasoning?.json";

export function loadReasoningGraph(): Graph {
    const cachePath = path.join(process.cwd(), REASONING_CACHE);
    return loadGraph(cachePath) ?? new Graph();
}

export function saveReasoningGraph(graph: Graph): void {
    const cachePath = path.join(process.cwd(), REASONING_CACHE);
    saveGraph(graph, cachePath);
}


export function addReasoning(graph: Graph, data: NodeData): void {
    if (!data.reasoning) return;

    const timestamp = new Date();
    const promptId = crypto.randomUUID();
    graph.addNode({ graphType: "Reasoning", id: promptId, type: "user_prompt", data: { text: data.reasoning.prompt, timestamp } });

    const thoughtId = crypto.randomUUID();
    graph.addNode({ graphType: "Reasoning", id: thoughtId, type: "agent_thought", data: { text: data.reasoning.thoughtDescription, timestamp, description: data.reasoning.thoughtDetails } });

    const toolId = crypto.randomUUID();
    graph.addNode({
        graphType: "Reasoning", id: toolId, type: "tool_call", data: {
            toolCall: {
                tool: data.toolCall?.tool!,
                result: data.toolCall?.result!
            }
        }
    })
    const solutionId = crypto.randomUUID();
    graph.addNode({
        graphType: "Reasoning",
        id: solutionId, type: "implementation", data: { text: data.reasoning.solution, timestamp },
        metadata: {
            agent: data.reasoning.agent,
            project: data.reasoning.project,
            model: data.reasoning.model,
            run_id: data.reasoning.run_id
        }
    });

    graph.addEdge({ from: promptId, to: thoughtId, type: "THINKS" });
    graph.addEdge({ from: thoughtId, to: solutionId, type: "GENERATED_BY" });
}
