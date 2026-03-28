import { describe, it, expect, beforeEach } from "bun:test";
import { Graph } from "./Graph.js";

let graph: Graph;

beforeEach(() => {
    graph = new Graph();
});

describe("Graph.addNode / getNode", () => {
    it("stores a node and retrieves it by id", () => {
        graph.addNode({ graphType: "Code", id: "n1", type: "file", data: { path: "/a.ts" } });
        const node = graph.getNode("n1");
        expect(node).toBeDefined();
        expect(node?.id).toBe("n1");
        expect(node?.type).toBe("file");
    });

    it("returns undefined for an unknown id", () => {
        expect(graph.getNode("nonexistent")).toBeUndefined();
    });

    it("overwrites a node when the same id is added twice", () => {
        graph.addNode({ graphType: "Code", id: "n1", type: "file", data: { path: "/a.ts" } });
        graph.addNode({ graphType: "Code", id: "n1", type: "function", data: { name: "foo" } });
        expect(graph.getNode("n1")?.type).toBe("function");
        expect(graph.nodes.size).toBe(1);
    });

    it("stores multiple independent nodes", () => {
        graph.addNode({ graphType: "Code", id: "n1", type: "file", data: {} });
        graph.addNode({ graphType: "Code", id: "n2", type: "class", data: {} });
        graph.addNode({ graphType: "Code", id: "n3", type: "function", data: {} });
        expect(graph.nodes.size).toBe(3);
    });
});

describe("Graph.addEdge / getEdgesFrom", () => {
    it("stores an edge and retrieves it via getEdgesFrom", () => {
        graph.addEdge({ from: "a", to: "b", type: "IMPORTS" });
        const edges = graph.getEdgesFrom("a");
        expect(edges).toHaveLength(1);
        expect(edges[0].to).toBe("b");
        expect(edges[0].type).toBe("IMPORTS");
    });

    it("returns an empty array when no edges originate from that id", () => {
        graph.addEdge({ from: "a", to: "b", type: "IMPORTS" });
        expect(graph.getEdgesFrom("b")).toHaveLength(0);
        expect(graph.getEdgesFrom("unknown")).toHaveLength(0);
    });

    it("returns all edges from the same source node", () => {
        graph.addEdge({ from: "a", to: "b", type: "IMPORTS" });
        graph.addEdge({ from: "a", to: "c", type: "CALLS" });
        graph.addEdge({ from: "d", to: "e", type: "DEFINES" });

        const edges = graph.getEdgesFrom("a");
        expect(edges).toHaveLength(2);
        const targets = edges.map((e) => e.to);
        expect(targets).toContain("b");
        expect(targets).toContain("c");
    });

    it("allows duplicate edges (same from/to/type)", () => {
        graph.addEdge({ from: "a", to: "b", type: "CALLS" });
        graph.addEdge({ from: "a", to: "b", type: "CALLS" });
        expect(graph.edges).toHaveLength(2);
    });

    it("stores edges independently from nodes — works with no nodes added", () => {
        graph.addEdge({ from: "x", to: "y", type: "DEFINES" });
        expect(graph.edges).toHaveLength(1);
    });
});
