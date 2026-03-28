import { describe, it, expect } from "bun:test";
import { Graph } from "../graph/Graph.js";
import { expandGraph } from "./expandGraph.js";
// Helper: quickly wire up a graph for traversal tests
function makeGraph() {
    const g = new Graph();
    // A → B → C → D (chain)
    //         ↓
    //         E
    for (const id of ["A", "B", "C", "D", "E"]) {
        g.addNode({ graphType: "Code", id, type: "file", data: {} });
    }
    g.addEdge({ from: "A", to: "B", type: "IMPORTS" });
    g.addEdge({ from: "B", to: "C", type: "IMPORTS" });
    g.addEdge({ from: "C", to: "D", type: "IMPORTS" });
    g.addEdge({ from: "C", to: "E", type: "IMPORTS" });
    return g;
}
describe("expandGraph", () => {
    it("always includes the start node", () => {
        const g = makeGraph();
        const { nodes } = expandGraph(g, "A", 0);
        const ids = nodes.map((n) => n.id);
        expect(ids).toContain("A");
    });
    it("visits only the start node's direct children when depth is 0", () => {
        const g = makeGraph();
        // With depth=0: level 0 < 0 is false → no neighbours pushed.
        // Only A itself is visited; its outgoing edge (A→B) is still collected.
        const { nodes, edges } = expandGraph(g, "A", 0);
        const ids = nodes.map((n) => n.id);
        expect(ids).toContain("A");
        expect(ids).not.toContain("B");
        // Edge from A is collected even though B is not visited
        expect(edges.some((e) => e.from === "A" && e.to === "B")).toBe(true);
    });
    it("with depth=1, visits A and B but not C/D/E", () => {
        const g = makeGraph();
        const { nodes } = expandGraph(g, "A", 1);
        const ids = nodes.map((n) => n.id);
        expect(ids).toContain("A");
        expect(ids).toContain("B");
        expect(ids).not.toContain("D");
        expect(ids).not.toContain("E");
    });
    it("traverses deeper nodes when depth is large enough", () => {
        const g = makeGraph();
        const { nodes } = expandGraph(g, "A", 10);
        const ids = nodes.map((n) => n.id);
        expect(ids).toContain("A");
        expect(ids).toContain("B");
        expect(ids).toContain("C");
        expect(ids).toContain("D");
        expect(ids).toContain("E");
    });
    it("does not visit the same node twice (cycle safety)", () => {
        const g = makeGraph();
        // Create a cycle: D → A
        g.addEdge({ from: "D", to: "A", type: "IMPORTS" });
        const { nodes } = expandGraph(g, "A", 100);
        const ids = nodes.map((n) => n.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });
    it("collects edges from all visited nodes", () => {
        const g = makeGraph();
        const { edges } = expandGraph(g, "A", 10);
        // A→B, B→C, C→D, C→E are the four edges in the graph
        expect(edges.length).toBeGreaterThanOrEqual(4);
    });
    it("returns empty nodes/edges for an unknown start id", () => {
        const g = makeGraph();
        const { nodes, edges } = expandGraph(g, "UNKNOWN_NODE", 5);
        expect(edges).toHaveLength(0);
    });
    it("works on a graph with a single isolated node", () => {
        const g = new Graph();
        g.addNode({ graphType: "Code", id: "solo", type: "file", data: {} });
        const { nodes, edges } = expandGraph(g, "solo", 5);
        expect(nodes.map((n) => n.id)).toContain("solo");
        expect(edges).toHaveLength(0);
    });
});
