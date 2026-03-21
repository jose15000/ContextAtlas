import path from "path";
import { Graph } from "../Graph.js";
import { saveGraph, loadGraph } from "../persistence.js";
const REASONING_CACHE = "./context/.codeatlas-reasoning.json";
export function loadReasoningGraph() {
    const cachePath = path.join(process.cwd(), REASONING_CACHE);
    return loadGraph(cachePath) ?? new Graph();
}
export function saveReasoningGraph(graph) {
    const cachePath = path.join(process.cwd(), REASONING_CACHE);
    saveGraph(graph, cachePath);
}
export function addReasoning(graph, reasoning) {
    const timestamp = new Date().toISOString();
    const promptId = crypto.randomUUID();
    graph.addNode({ id: promptId, type: "user_prompt", data: { text: reasoning.prompt, timestamp } });
    const thoughtId = crypto.randomUUID();
    graph.addNode({ id: thoughtId, type: "agent_thought", data: { text: reasoning.thought, timestamp } });
    const solutionId = crypto.randomUUID();
    graph.addNode({
        id: solutionId, type: "implementation", data: { text: reasoning.solution, timestamp },
        metadata: {
            agent: reasoning.agent, project: reasoning.project, model: reasoning.model,
            run_id: reasoning.run_id
        }
    });
    graph.addEdge({ from: promptId, to: thoughtId, type: "THINKS" });
    graph.addEdge({ from: thoughtId, to: solutionId, type: "GENERATED_BY" });
}
