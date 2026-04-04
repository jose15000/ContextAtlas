export class Graph {
    constructor() {
        this.nodes = new Map();
        this.edges = [];
    }
    addNode(node) {
        this.nodes.set(node.id, node);
    }
    addEdge(edge) {
        this.edges.push(edge);
    }
    getNode(id) {
        return this.nodes.get(id);
    }
    getEdgesFrom(id) {
        return this.edges.filter(e => e.from === id);
    }
    getEdgesTo(id) {
        return this.edges.filter(e => e.to === id);
    }
}
