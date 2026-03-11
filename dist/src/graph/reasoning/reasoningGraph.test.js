import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import fs from "fs";
import path from "path";
import os from "os";
// reasoningGraph.ts resolves the cache path as:
//   path.join(process.cwd(), ".codeatlas-reasoning.json")
// We spy on process.cwd() to point it at a temp dir so no real files are touched.
let tmpDir;
let cwdSpy;
import { addReasoning, getReasoningGraph } from "./reasoningGraph.js";
const cacheName = ".codeatlas-reasoning.json";
function cachePath() {
    return path.join(tmpDir, cacheName);
}
beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codeatlas-reasoning-test-"));
    cwdSpy = spyOn(process, "cwd").mockReturnValue(tmpDir);
});
afterEach(() => {
    cwdSpy.mockRestore();
    fs.rmSync(tmpDir, { recursive: true, force: true });
});
// ---------------------------------------------------------------------------
// getReasoningGraph
// ---------------------------------------------------------------------------
describe("getReasoningGraph", () => {
    it("returns an empty Graph when no cache file exists", () => {
        const graph = getReasoningGraph();
        expect(graph.nodes.size).toBe(0);
        expect(graph.edges.length).toBe(0);
    });
    it("returns the persisted graph when a cache file exists", () => {
        const seed = {
            nodes: [{ id: "n1", type: "user_prompt", data: { text: "hello" } }],
            edges: [],
        };
        fs.writeFileSync(cachePath(), JSON.stringify(seed, null, 2), "utf-8");
        const graph = getReasoningGraph();
        expect(graph.nodes.size).toBe(1);
        expect(graph.getNode("n1")).toBeDefined();
        expect(graph.getNode("n1")?.data.text).toBe("hello");
    });
    it("returns an empty Graph when the cache file is corrupted", () => {
        fs.writeFileSync(cachePath(), "NOT_VALID_JSON", "utf-8");
        const graph = getReasoningGraph();
        expect(graph.nodes.size).toBe(0);
        expect(graph.edges.length).toBe(0);
    });
});
// ---------------------------------------------------------------------------
// addReasoning
// ---------------------------------------------------------------------------
describe("addReasoning", () => {
    it("creates the cache file after the first call", () => {
        expect(fs.existsSync(cachePath())).toBe(false);
        addReasoning("prompt", "thought", "solution");
        expect(fs.existsSync(cachePath())).toBe(true);
    });
    it("adds exactly 3 nodes and 2 edges per call", () => {
        addReasoning("my prompt", "my thought", "my solution");
        const graph = getReasoningGraph();
        expect(graph.nodes.size).toBe(3);
        expect(graph.edges.length).toBe(2);
    });
    it("creates nodes with the correct types", () => {
        addReasoning("p", "t", "s");
        const graph = getReasoningGraph();
        const types = Array.from(graph.nodes.values()).map((n) => n.type);
        expect(types).toContain("user_prompt");
        expect(types).toContain("agent_thought");
        expect(types).toContain("implementation");
    });
    it("creates nodes with the correct text payloads", () => {
        addReasoning("my prompt", "my thought", "my solution");
        const graph = getReasoningGraph();
        const nodes = Array.from(graph.nodes.values());
        const promptNode = nodes.find((n) => n.type === "user_prompt");
        const thoughtNode = nodes.find((n) => n.type === "agent_thought");
        const solutionNode = nodes.find((n) => n.type === "implementation");
        expect(promptNode?.data.text).toBe("my prompt");
        expect(thoughtNode?.data.text).toBe("my thought");
        expect(solutionNode?.data.text).toBe("my solution");
    });
    it("connects nodes with THINKS and GENERATED_BY edges", () => {
        addReasoning("p", "t", "s");
        const graph = getReasoningGraph();
        const edgeTypes = graph.edges.map((e) => e.type);
        expect(edgeTypes).toContain("THINKS");
        expect(edgeTypes).toContain("GENERATED_BY");
    });
    it("edges point in the right direction: prompt → thought → solution", () => {
        addReasoning("p", "t", "s");
        const graph = getReasoningGraph();
        const nodes = Array.from(graph.nodes.values());
        const promptNode = nodes.find((n) => n.type === "user_prompt");
        const thoughtNode = nodes.find((n) => n.type === "agent_thought");
        const solutionNode = nodes.find((n) => n.type === "implementation");
        const thinksEdge = graph.edges.find((e) => e.type === "THINKS");
        const generatedByEdge = graph.edges.find((e) => e.type === "GENERATED_BY");
        expect(thinksEdge?.from).toBe(promptNode.id);
        expect(thinksEdge?.to).toBe(thoughtNode.id);
        expect(generatedByEdge?.from).toBe(thoughtNode.id);
        expect(generatedByEdge?.to).toBe(solutionNode.id);
    });
    it("accumulates entries across multiple calls", () => {
        addReasoning("prompt 1", "thought 1", "solution 1");
        addReasoning("prompt 2", "thought 2", "solution 2");
        const graph = getReasoningGraph();
        expect(graph.nodes.size).toBe(6);
        expect(graph.edges.length).toBe(4);
    });
    it("each node has a valid ISO timestamp in its data", () => {
        addReasoning("p", "t", "s");
        const graph = getReasoningGraph();
        for (const node of graph.nodes.values()) {
            const ts = node.data.timestamp;
            expect(ts).toBeDefined();
            expect(new Date(ts).toISOString()).toBe(ts);
        }
    });
    it("assigns unique IDs to nodes across multiple calls", () => {
        addReasoning("p1", "t1", "s1");
        addReasoning("p2", "t2", "s2");
        const graph = getReasoningGraph();
        const ids = Array.from(graph.nodes.keys());
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });
});
