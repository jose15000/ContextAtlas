import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs";
import path from "path";
import os from "os";
import { Graph } from "./Graph.js";
import { saveGraph, loadGraph } from "./persistence.js";

let tmpDir: string;
let filePath: string;

beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codeatlas-persistence-test-"));
    filePath = path.join(tmpDir, "graph.json");
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// saveGraph
// ---------------------------------------------------------------------------

describe("saveGraph", () => {
    it("creates the JSON file on disk", () => {
        const graph = new Graph();
        saveGraph(graph, filePath);
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it("serializes nodes and edges correctly", () => {
        const graph = new Graph();
        graph.addNode({ id: "n1", type: "file", data: { path: "/a.ts" } });
        graph.addEdge({ from: "n1", to: "n2", type: "IMPORTS" });

        saveGraph(graph, filePath);

        const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        expect(raw.nodes).toHaveLength(1);
        expect(raw.nodes[0].id).toBe("n1");
        expect(raw.edges).toHaveLength(1);
        expect(raw.edges[0].type).toBe("IMPORTS");
    });

    it("serializes an empty graph as empty arrays", () => {
        const graph = new Graph();
        saveGraph(graph, filePath);

        const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        expect(raw.nodes).toEqual([]);
        expect(raw.edges).toEqual([]);
    });

    it("overwrites an existing file on subsequent saves", () => {
        const graph1 = new Graph();
        graph1.addNode({ id: "n1", type: "file", data: {} });
        saveGraph(graph1, filePath);

        const graph2 = new Graph();
        saveGraph(graph2, filePath);

        const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        expect(raw.nodes).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// loadGraph
// ---------------------------------------------------------------------------

describe("loadGraph", () => {
    it("returns null when the file does not exist", () => {
        expect(loadGraph(path.join(tmpDir, "missing.json"))).toBeNull();
    });

    it("returns null when the file contains invalid JSON", () => {
        fs.writeFileSync(filePath, "INVALID_JSON", "utf-8");
        expect(loadGraph(filePath)).toBeNull();
    });

    it("rehydrates nodes into the Graph map", () => {
        const seed = {
            nodes: [{ id: "n1", type: "function", data: { name: "foo" } }],
            edges: [],
        };
        fs.writeFileSync(filePath, JSON.stringify(seed), "utf-8");

        const graph = loadGraph(filePath)!;
        expect(graph).not.toBeNull();
        expect(graph.nodes.size).toBe(1);
        expect(graph.getNode("n1")?.type).toBe("function");
    });

    it("rehydrates edges into the Graph edges array", () => {
        const seed = {
            nodes: [],
            edges: [{ from: "a", to: "b", type: "CALLS" }],
        };
        fs.writeFileSync(filePath, JSON.stringify(seed), "utf-8");

        const graph = loadGraph(filePath)!;
        expect(graph.edges).toHaveLength(1);
        expect(graph.edges[0].from).toBe("a");
        expect(graph.edges[0].type).toBe("CALLS");
    });

    it("round-trips a graph through save then load without data loss", () => {
        const original = new Graph();
        original.addNode({ id: "n1", type: "class", data: { name: "MyClass" } });
        original.addNode({ id: "n2", type: "method", data: { name: "myMethod" } });
        original.addEdge({ from: "n1", to: "n2", type: "DEFINES" });

        saveGraph(original, filePath);
        const loaded = loadGraph(filePath)!;

        expect(loaded.nodes.size).toBe(2);
        expect(loaded.getNode("n2")?.data.name).toBe("myMethod");
        expect(loaded.edges).toHaveLength(1);
        expect(loaded.getEdgesFrom("n1")[0].type).toBe("DEFINES");
    });
});
