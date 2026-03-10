import path from "path";
import { Graph } from "../Graph.js";
import { saveGraph, loadGraph } from "../persistence.js";
const REASONING_CACHE = ".codeatlas-reasoning.json";
export function addReasoning(prompt, thought, solution) {
    const cachePath = path.join(process.cwd(), REASONING_CACHE);
    const graph = loadGraph(cachePath) ?? new Graph();
    const timestamp = new Date().toISOString();
    const promptId = crypto.randomUUID();
    graph.addNode({
        id: promptId,
        type: "user_prompt",
        data: { text: prompt, timestamp }
    });
    const thoughtId = crypto.randomUUID();
    graph.addNode({
        id: thoughtId,
        type: "agent_thought",
        data: { text: thought, timestamp }
    });
    const solutionId = crypto.randomUUID();
    ;
    graph.addNode({
        id: solutionId,
        type: "implementation",
        data: { text: solution, timestamp }
    });
    graph.addEdge({ from: promptId, to: thoughtId, type: "THINKS" });
    graph.addEdge({ from: thoughtId, to: solutionId, type: "GENERATED_BY" });
    saveGraph(graph, cachePath);
}
export function getReasoningGraph() {
    const cachePath = path.join(process.cwd(), REASONING_CACHE);
    return loadGraph(cachePath) ?? new Graph();
}
