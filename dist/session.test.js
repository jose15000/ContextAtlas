import { describe, it, expect } from "bun:test";
import { Graph } from "./src/graph/Graph.js";
import { addPrompt } from "./session/addPrompt.js";
import { addThought } from "./session/addThought.js";
import { addToolCall } from "./session/addToolCall.js";
import { addCodeChange } from "./session/addCodeChange.js";
// ---------------------------------------------------------------------------
// addPrompt
// ---------------------------------------------------------------------------
describe("addPrompt", () => {
    it("adds a user_prompt node to the graph", () => {
        const g = new Graph();
        const id = addPrompt(g, "What is 2+2?");
        expect(g.nodes.size).toBe(1);
        const node = g.getNode(id);
        expect(node?.type).toBe("user_prompt");
        expect(node?.data.prompt).toBe("What is 2+2?");
    });
    it("returns the id of the created node", () => {
        const g = new Graph();
        const id = addPrompt(g, "hello");
        expect(typeof id).toBe("string");
        expect(id.length).toBeGreaterThan(0);
        expect(g.getNode(id)).toBeDefined();
    });
    it("does not add any edges", () => {
        const g = new Graph();
        addPrompt(g, "test");
        expect(g.edges).toHaveLength(0);
    });
    it("generates unique ids when called multiple times", () => {
        const g = new Graph();
        const id1 = addPrompt(g, "first");
        const id2 = addPrompt(g, "second");
        expect(id1).not.toBe(id2);
        expect(g.nodes.size).toBe(2);
    });
});
// ---------------------------------------------------------------------------
// addThought
// ---------------------------------------------------------------------------
describe("addThought", () => {
    it("adds an agent_thought node to the graph", () => {
        const g = new Graph();
        const promptId = addPrompt(g, "Why?");
        const thoughtId = addThought(g, promptId, "Because entropy.");
        const node = g.getNode(thoughtId);
        expect(node?.type).toBe("agent_thought");
        expect(node?.data.thought).toBe("Because entropy.");
    });
    it("returns the id of the created thought node", () => {
        const g = new Graph();
        const promptId = addPrompt(g, "Why?");
        const thoughtId = addThought(g, promptId, "Reason");
        expect(g.getNode(thoughtId)).toBeDefined();
    });
    it("creates a THINKS edge from promptId → thoughtId", () => {
        const g = new Graph();
        const promptId = addPrompt(g, "Why?");
        const thoughtId = addThought(g, promptId, "Reason");
        const edges = g.getEdgesFrom(promptId);
        expect(edges).toHaveLength(1);
        expect(edges[0].to).toBe(thoughtId);
        expect(edges[0].type).toBe("THINKS");
    });
    it("generates a unique id different from the prompt id", () => {
        const g = new Graph();
        const promptId = addPrompt(g, "Q?");
        const thoughtId = addThought(g, promptId, "A.");
        expect(thoughtId).not.toBe(promptId);
    });
});
// ---------------------------------------------------------------------------
// addToolCall
// ---------------------------------------------------------------------------
describe("addToolCall", () => {
    it("adds a tool_call node to the graph", () => {
        const g = new Graph();
        const promptId = addPrompt(g, "prompt");
        const thoughtId = addThought(g, promptId, "thinking");
        const toolId = addToolCall(g, "search_symbol", thoughtId);
        const node = g.getNode(toolId);
        expect(node?.type).toBe("tool_call");
        expect(node?.data.tool).toBe("search_symbol");
    });
    it("creates a CALLS_TOOL edge from thoughtId → toolCallId", () => {
        const g = new Graph();
        const promptId = addPrompt(g, "p");
        const thoughtId = addThought(g, promptId, "t");
        const toolId = addToolCall(g, "get_file", thoughtId);
        const edges = g.getEdgesFrom(thoughtId);
        // One THINKS edge from before, plus one CALLS_TOOL edge
        const callsEdge = edges.find((e) => e.type === "CALLS_TOOL");
        expect(callsEdge).toBeDefined();
        expect(callsEdge?.to).toBe(toolId);
    });
    it("returns the id of the created tool_call node", () => {
        const g = new Graph();
        const thoughtId = "fake-thought-id";
        const toolId = addToolCall(g, "my_tool", thoughtId);
        expect(typeof toolId).toBe("string");
        expect(g.getNode(toolId)).toBeDefined();
    });
});
// ---------------------------------------------------------------------------
// addCodeChange
// ---------------------------------------------------------------------------
describe("addCodeChange", () => {
    it("adds a code_change node to the graph", () => {
        const g = new Graph();
        const thoughtId = "fake-thought-id";
        const changeId = addCodeChange(g, "Added null check", thoughtId);
        const node = g.getNode(changeId);
        expect(node?.type).toBe("code_change");
        expect(node?.data.change).toBe("Added null check");
    });
    it("creates a MODIFIES edge from thoughtId → changeId", () => {
        const g = new Graph();
        const promptId = addPrompt(g, "p");
        const thoughtId = addThought(g, promptId, "t");
        const changeId = addCodeChange(g, "fix", thoughtId);
        const edges = g.getEdgesFrom(thoughtId);
        const modifiesEdge = edges.find((e) => e.type === "MODIFIES");
        expect(modifiesEdge).toBeDefined();
        expect(modifiesEdge?.to).toBe(changeId);
    });
    it("returns the id of the created code_change node", () => {
        const g = new Graph();
        const changeId = addCodeChange(g, "delta", "thought-id");
        expect(typeof changeId).toBe("string");
        expect(g.getNode(changeId)).toBeDefined();
    });
});
// ---------------------------------------------------------------------------
// Integration: full session chain
// ---------------------------------------------------------------------------
describe("session chain integration", () => {
    it("builds a coherent graph: prompt → thought → tool + code_change", () => {
        const g = new Graph();
        const promptId = addPrompt(g, "Refactor the indexer");
        const thoughtId = addThought(g, promptId, "I should read the file first");
        const toolId = addToolCall(g, "get_file", thoughtId);
        const changeId = addCodeChange(g, "Extracted helper function", thoughtId);
        // 4 nodes total
        expect(g.nodes.size).toBe(4);
        // 3 edges: THINKS + CALLS_TOOL + MODIFIES
        expect(g.edges).toHaveLength(3);
        // Correct edge routing
        const fromPrompt = g.getEdgesFrom(promptId);
        expect(fromPrompt[0].type).toBe("THINKS");
        expect(fromPrompt[0].to).toBe(thoughtId);
        const fromThought = g.getEdgesFrom(thoughtId);
        const types = fromThought.map((e) => e.type);
        expect(types).toContain("CALLS_TOOL");
        expect(types).toContain("MODIFIES");
        // Tool and change nodes exist
        expect(g.getNode(toolId)?.data.tool).toBe("get_file");
        expect(g.getNode(changeId)?.data.change).toBe("Extracted helper function");
    });
});
