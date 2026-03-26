import path from "path";
import { Graph } from "../Graph.js";
import { saveGraph, loadGraph } from "../persistence.js";
const CHANGES_CACHE = "./context/codeatlas-changes.json";
export function loadChangesGraph() {
    const cachePath = path.join(process.cwd(), CHANGES_CACHE);
    return loadGraph(cachePath) ?? new Graph();
}
export function saveChangesGraph(graph) {
    const cachePath = path.join(process.cwd(), CHANGES_CACHE);
    saveGraph(graph, cachePath);
}
export function addCodeChange(graph, entry) {
    const timestamp = new Date();
    const changeId = crypto.randomUUID();
    graph.addNode({
        graphType: "Code",
        id: changeId,
        type: "code_change",
        data: { file: entry.file, agentThought: entry.agentThought, description: entry.description, diff: entry.diff, timestamp }
    });
    graph.addEdge({ from: changeId, to: entry.file, type: "MODIFIES" });
    if (entry.thoughtId) {
        graph.addEdge({ from: entry.thoughtId, to: changeId, type: "MODIFIES" });
    }
    return changeId;
}
export function getChangesForFile(file, nodeType) {
    let graph = new Graph;
    return Array.from(graph.nodes.values()).filter(n => n.type === nodeType && n.data.file === file);
}
