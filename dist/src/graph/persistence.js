import fs from "fs";
import { Graph } from "./Graph.js";
export function saveGraph(graph, filePath) {
    const data = {
        nodes: Array.from(graph.nodes.values()),
        edges: graph.edges,
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
export function loadGraph(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(raw);
        const graph = new Graph();
        for (const node of data.nodes) {
            graph.addNode(node);
        }
        for (const edge of data.edges) {
            graph.addEdge(edge);
        }
        return graph;
    }
    catch {
        return null;
    }
}
