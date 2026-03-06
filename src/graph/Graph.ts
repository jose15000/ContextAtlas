import { Edge } from "../../types/Edge";
import { Node } from "../../types/Node";

export class Graph {
    nodes = new Map<string, Node>();
    edges = new Map<string, Edge[]>();

    addNode(node: Node) {
        this.nodes.set(node.id, node)

    }
    addEdge(edge: Edge) {
        if (!this.edges.has(edge.from)) {
            this.edges.set(edge.from, [])
        }

        this.edges.get(edge.from)!.push(edge);
    }

    getNeighbors(nodeId: string) {
        return this.edges.get(nodeId) || [];
    }
}