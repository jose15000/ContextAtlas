import fs from "fs";
import { Graph } from "./Graph.js";
import { Node } from "../../types/Node.js";
import { Edge } from "../../types/Edge.js";

interface SerializedGraph {
    nodes: Node[];
    edges: Edge[];
}

export function saveGraph(graph: Graph, filePath: string): void {
    const data: SerializedGraph = {
        nodes: Array.from(graph.nodes.values()),
        edges: graph.edges,
    };
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
        // Cache corrupted — will be rebuilt
        return null;
    }
}
