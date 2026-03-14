#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import path from "path";
import { loadOrBuildGraph } from "./functions/loadOrBuildGraph.js";
import { findSymbol } from "./functions/findSymbol.js";
import { expandNode } from "./functions/expandNode.js";
import { getFile } from "./functions/getFile.js";
import { traceCallers } from "./functions/traceCallers.js";
import { traceCallees } from "./functions/traceCallees.js";
import { searchSymbol } from "./functions/searchSymbol.js";
import { saveReasoning } from "./functions/saveReasoning.js";
import { saveCodeChange, getFileHistory, getAllChanges } from "./functions/codeChanges.js";
import { loadReasoningGraph } from "../graph/reasoning/reasoningGraph.js";
import { loadChangesGraph } from "../graph/changes/changes.js";
// ─── Load all three graphs into memory at startup ────────────────────────────
const CACHE_PATH = path.join(process.cwd(), ".codeatlas-cache.json");
const codeGraph = loadOrBuildGraph(CACHE_PATH);
const reasoningGraph = loadReasoningGraph();
const changesGraph = loadChangesGraph();
console.error(`[CodeAtlas] Reasoning graph: ${reasoningGraph.nodes.size} nodes`);
console.error(`[CodeAtlas] Changes graph:   ${changesGraph.nodes.size} nodes`);
// ─── MCP Server ───────────────────────────────────────────────────────────────
const server = new McpServer({ name: "CodeAtlas", version: "1.0.0" }, { capabilities: { tools: {} } });
// Code Graph tools
server.registerTool("find_symbol", {
    description: "Find code entities (functions, classes, methods, interfaces) by name. Returns id, type, file and name.",
    inputSchema: { symbol: z.string().describe("Name or partial name to search for, e.g. 'login'") }
}, async ({ symbol }) => findSymbol(codeGraph, symbol));
server.registerTool("expand_node", {
    description: "Expand the graph around a node via BFS up to a given depth. Returns all reachable nodes and edges.",
    inputSchema: {
        nodeId: z.string().describe("Full node id, e.g. '/abs/path/file.ts#MyClass.myMethod'"),
        depth: z.number().int().min(1).max(5).describe("Number of hops to expand (1-5)")
    }
}, async ({ nodeId, depth }) => expandNode(codeGraph, nodeId, depth));
server.registerTool("get_file", {
    description: "Returns the text content of a specified file.",
    inputSchema: { path: z.string().describe("Path to the file to read") }
}, async ({ path: filePath }) => getFile(filePath));
server.registerTool("trace_callers", {
    description: "Finds all functions/methods that call the given function. Shows who depends on this.",
    inputSchema: { functionName: z.string().describe("Name of the function or method to trace callers for") }
}, async ({ functionName }) => traceCallers(codeGraph, functionName));
server.registerTool("trace_callees", {
    description: "Finds all functions/methods called by the given node. Shows what this depends on.",
    inputSchema: { nodeId: z.string().describe("Full node ID of the function/method") }
}, async ({ nodeId }) => traceCallees(codeGraph, nodeId));
server.registerTool("search_symbol", {
    description: "Search for code symbols by partial name. Returns id, type and name.",
    inputSchema: { query: z.string().describe("Partial string query to search for") }
}, async ({ query }) => searchSymbol(codeGraph, query));
// Reasoning Graph tools
server.registerTool("create_reasoning_context_graph", {
    description: "Saves a reasoning entry (prompt → thought → solution) to the agent memory graph.",
    inputSchema: {
        prompt: z.string().describe("The user's original request"),
        thought: z.string().describe("Your reasoning process"),
        solution: z.string().describe("The solution you applied")
    }
}, async ({ prompt, thought, solution }) => saveReasoning(reasoningGraph, prompt, thought, solution));
// Changes Graph tools
server.registerTool("save_code_change", {
    description: "Records a code change made to a file. Call this after editing a file to keep the Changes Graph updated.",
    inputSchema: {
        file: z.string().describe("Absolute or relative path to the modified file"),
        description: z.string().describe("Short description of what was changed and why"),
        diff: z.string().optional().describe("Optional: the actual diff or snippet of the change"),
        thoughtId: z.string().optional().describe("Optional: ID of the agent thought that caused this change")
    }
}, async ({ file, description, diff, thoughtId }) => saveCodeChange(changesGraph, file, description, diff, thoughtId));
server.registerTool("get_file_history", {
    description: "Returns all recorded changes for a specific file.",
    inputSchema: { file: z.string().describe("Path to the file") }
}, async ({ file }) => getFileHistory(changesGraph, file));
server.registerTool("get_all_changes", {
    description: "Returns all recorded code changes across the project, sorted by time.",
    inputSchema: {}
}, async () => getAllChanges(changesGraph));
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("CodeAtlas MCP Server running on stdio");
}
main().catch(console.error);
