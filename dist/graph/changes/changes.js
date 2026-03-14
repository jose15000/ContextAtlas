import path from "path";
import { Graph } from "../Graph.js";
import { saveGraph, loadGraph } from "../persistence.js";
const CHANGES_CACHE = "./changes/codeatlas-changes.json";
export function loadChangesGraph() {
    const cachePath = path.join(process.cwd(), CHANGES_CACHE);
    return loadGraph(cachePath) ?? new Graph();
}
export function saveChangesGraph(graph) {
    const cachePath = path.join(process.cwd(), CHANGES_CACHE);
    saveGraph(graph, cachePath);
}
export function addCodeChange(graph, entry) {
    const timestamp = new Date().toISOString();
    const changeId = crypto.randomUUID();
    graph.addNode({
        id: changeId,
        type: "code_change",
        data: { file: entry.file, description: entry.description, diff: entry.diff ?? null, timestamp }
    });
    graph.addEdge({ from: changeId, to: entry.file, type: "MODIFIES" });
    if (entry.thoughtId) {
        graph.addEdge({ from: entry.thoughtId, to: changeId, type: "MODIFIES" });
    }
    return changeId;
}
export function getChangesForFile(graph, file) {
    return Array.from(graph.nodes.values()).filter(n => n.type === "code_change" && n.data.file === file);
}
