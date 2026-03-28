import fs from "fs";
import path from "path";
import { Graph } from "../core/graph/Graph.js";
import { Node } from "../core/graph/models/Node.js";
import { Edge } from "../core/graph/models/Edge.js";

interface SerializedGraph {
    nodes: Node[];
    edges: Edge[];
}

export function saveGraph(graph: Graph, filePath: string): void {
    const data: SerializedGraph = {
        nodes: Array.from(graph.nodes.values()),
        edges: graph.edges,
    };
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function loadGraph(filePath: string): Graph | null {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const data: SerializedGraph = JSON.parse(raw);

        const graph = new Graph();
        for (const node of data.nodes) {
            graph.addNode(node);
        }
        for (const edge of data.edges) {
            graph.addEdge(edge);
        }
        return graph;
    } catch {
        return null;
    }
}
