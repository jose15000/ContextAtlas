import path from "path";
import { Graph } from "../Graph.js";
import { saveGraph, loadGraph } from "../persistence.js";
import { IReasoning } from "../../types/Reasoning.js";

const REASONING_CACHE = "./context/.codeatlas-reasoning.json";

export function loadReasoningGraph(): Graph {
    const cachePath = path.join(process.cwd(), REASONING_CACHE);
    return loadGraph(cachePath) ?? new Graph();
}

export function saveReasoningGraph(graph: Graph): void {
    const cachePath = path.join(process.cwd(), REASONING_CACHE);
    saveGraph(graph, cachePath);
}


export function addReasoning(graph: Graph, reasoning: IReasoning): void {
    const timestamp = new Date();
    const promptId = crypto.randomUUID();
    graph.addNode({ graphType: "Reasoning", id: promptId, type: "user_prompt", data: { text: reasoning.prompt, timestamp } });

    const thoughtId = crypto.randomUUID();
    graph.addNode({ graphType: "Reasoning", id: thoughtId, type: "agent_thought", data: { text: reasoning.thoughtDescription, timestamp, description: reasoning.thoughtDetails } });

    const solutionId = crypto.randomUUID();
    graph.addNode({
        graphType: "Reasoning",
        id: solutionId, type: "implementation", data: { text: reasoning.solution, timestamp },
        metadata: {
            agent: reasoning.agent, project:
                reasoning.project, model: reasoning.model,

            run_id: reasoning.run_id
        }
    });

    graph.addEdge({ from: promptId, to: thoughtId, type: "THINKS" });
    graph.addEdge({ from: thoughtId, to: solutionId, type: "GENERATED_BY" });
}
