import { Edge } from "./models/Edge.js"
import { Node } from "./models/Node.js"

export class Graph {

    nodes = new Map<string, Node>()
    edges: Edge[] = []

    addNode(node: Node) {
        this.nodes.set(node.id, node)
    }

    addEdge(edge: Edge) {
        this.edges.push(edge)
    }

    getNode(id: string) {
        return this.nodes.get(id)
    }

    getEdgesFrom(id: string) {
        return this.edges.filter(e => e.from === id)
    }

    getEdgesTo(id: string) {
        return this.edges.filter(e => e.to === id)
    }

}