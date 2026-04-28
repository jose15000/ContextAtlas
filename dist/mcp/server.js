#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import path from "path";
import { createRequire } from "module";
import { loadOrBuildGraph } from "../services/graph/loadOrBuildGraph.js";
import { loadReasoningGraph } from "../graph/reasoning/reasoningGraph.js";
import { loadChangesGraph } from "../graph/changes/changes.js";
import { SearchHandlers } from "./handlers/search.js";
import { GraphHandlers } from "./handlers/graph.js";
import { CodeHandlers } from "./handlers/code.js";
import { HistoryHandlers } from "./handlers/history.js";
import { ImpactHandlers } from "./handlers/impact.js";
import { BlastRadiusHandlers } from "./handlers/blastRadius.js";
import { DiscoveryHandlers } from "./handlers/discovery.js";
// ─── Read package version ─────────────────────────────────────────────────────
const require = createRequire(import.meta.url);
const { version: PKG_VERSION } = require("../../package.json");
// ─── Load all three graphs into memory at startup ────────────────────────────
const CACHE_PATH = path.join(process.cwd(), "./context/.codeatlas-cache.json");
const codeGraph = await loadOrBuildGraph(CACHE_PATH);
const reasoningGraph = loadReasoningGraph();
const changesGraph = loadChangesGraph();
console.error(`[CodeAtlas] Reasoning graph: ${reasoningGraph.nodes.size} nodes`);
console.error(`[CodeAtlas] Changes graph:   ${changesGraph.nodes.size} nodes`);
// ─── MCP Server ───────────────────────────────────────────────────────────────
const server = new McpServer({ name: "CodeAtlas", version: PKG_VERSION }, { capabilities: { tools: {} } });
// Code Graph tools
server.registerTool("find_symbol", {
    description: "Find code entities (functions, classes, methods, interfaces) by name. Returns id, type, file and name.",
    inputSchema: { symbol: z.string().describe("Name or partial name to search for, e.g. 'login'") }
}, async ({ symbol }) => SearchHandlers.handleFindSymbol(codeGraph, symbol));
server.registerTool("expand_node", {
    description: "Expand the graph around a node via BFS up to a given depth. Returns all reachable nodes and edges.",
    inputSchema: {
        nodeId: z.string().describe("Full node id, e.g. '/abs/path/file.ts#MyClass.myMethod'"),
        depth: z.number().int().min(1).max(5).describe("Number of hops to expand (1-5)")
    }
}, async ({ nodeId, depth }) => GraphHandlers.handleExpandNode(codeGraph, nodeId, depth));
server.registerTool("get_file", {
    description: "Returns the text content of a specified file.",
    inputSchema: { path: z.string().describe("Path to the file to read") }
}, async ({ path: filePath }) => CodeHandlers.handleGetFile(filePath));
server.registerTool("trace_callers", {
    description: "Finds all functions/methods that call the given function. Shows who depends on this.",
    inputSchema: { functionName: z.string().describe("Name of the function or method to trace callers for") }
}, async ({ functionName }) => CodeHandlers.handleTraceCallers(codeGraph, functionName));
server.registerTool("trace_callees", {
    description: "Finds all functions/methods called by the given node. Shows what this depends on.",
    inputSchema: { nodeId: z.string().describe("Full node ID of the function/method") }
}, async ({ nodeId }) => CodeHandlers.handleTraceCallees(codeGraph, nodeId));
server.registerTool("search_symbol", {
    description: "Search for code symbols by partial name. Returns id, type and name.",
    inputSchema: { query: z.string().describe("Partial string query to search for") }
}, async ({ query }) => SearchHandlers.handleSearchSymbol(codeGraph, query));
// Reasoning Graph tools
server.registerTool("create_reasoning_context_graph", {
    description: "Saves a reasoning entry (prompt → thought → solution) to the agent memory graph.",
    inputSchema: {
        prompt: z.string().describe("The user's original request"),
        thoughtDescription: z.string().describe("The description of your reasoning process"),
        thoughtDetails: z.enum(["decision", "plan", "observation", "bug", "fix", "test"]).describe("the details from your thought process."),
        solution: z.string().describe("The solution you applied"),
        toolCall: z.object({
            tool: z.object({
                name: z.string(),
                description: z.string()
            }),
            result: z.string()
        }).describe("The tool call details including the tool used and the result"),
        agent: z.string().describe("The agent that generated the reasoning"),
        model: z.string().describe("The model that was used"),
        project: z.string().describe("The associated project"),
        run_id: z.string().describe("The execution run ID. Ex: run_1")
    }
}, async ({ prompt, thoughtDescription, thoughtDetails, solution, toolCall, agent, model, project, run_id }) => HistoryHandlers.handleSaveReasoning(reasoningGraph, {
    prompt,
    thoughtDescription,
    thoughtDetails,
    solution,
    toolCall,
    agent,
    model,
    project,
    run_id
}));
// Changes Graph tools
server.registerTool("save_code_change", {
    description: "Records a code change made to a file. Call this after editing a file to keep the Changes Graph updated.",
    inputSchema: {
        file: z.string().describe("Absolute or relative path to the modified file"),
        description: z.string().describe("Short description of what was changed and why"),
        agentThought: z.enum([
            "decision", "plan", "observation", "bug", "fix", "test"
        ]).describe("use these parameters to describe your thoughts over the code change"),
        diff: z.string().optional().describe("Optional: the actual diff or snippet of the change"),
        thoughtId: z.string().optional().describe("Optional: ID of the agent thought that caused this change")
    }
}, async ({ file, description, agentThought, diff, thoughtId }) => HistoryHandlers.handleSaveCodeChange(changesGraph, { file, description, agentThought, diff, thoughtId }));
server.registerTool("get_file_history", {
    description: "Returns all recorded changes for a specific file.",
    inputSchema: {
        file: z.string().describe("Path to the file"),
        nodeType: z.enum([
            "file", "function", "method", "class", "import",
            "user_prompt", "tool_call", "tool_result",
            "code_change", "implementation", "context_lookup", "interface",
            "module", "exports"
        ]).describe("Type of the node (e.g. 'file')"),
        agentThought: z.enum([
            "decision", "plan", "observation", "bug", "fix", "test"
        ]).describe("use it to register the agent thought").optional(),
    }
}, async ({ file, nodeType }) => HistoryHandlers.handleGetFileHistory(changesGraph, nodeType, file));
server.registerTool("get_all_changes", {
    description: "Returns all recorded code changes across the project, sorted by time.",
    inputSchema: {}
}, async () => HistoryHandlers.handleGetAllChanges(changesGraph));
server.registerTool("find_bugs_by_file", {
    description: "Returns bugs registered during model reasoning.",
    inputSchema: {
        file: z.string().describe("the desired filepath")
    },
}, async ({ file }) => HistoryHandlers.handleGetBugsByFile(reasoningGraph, file));
server.registerTool("semantic_search", {
    description: "Returns the graph node that fits the most the given query.",
    inputSchema: {
        query: z.string().describe("the research query"),
        limit: z.number().int().min(1).max(50).default(5).describe("maximum number of results"),
        threshold: z.number().min(0).max(1).default(0.7).describe("similarity threshold (0-1)")
    },
}, async ({ query, limit, threshold }) => SearchHandlers.handleSemanticSearch(codeGraph, query, limit, threshold));
server.registerTool("get_impact", {
    description: "Returns the weights from the impacted nodes",
    inputSchema: {
        modifiedNodeIds: z.array(z.string()).describe("the IDs from modified nodes"),
        threshold: z.number().optional()
    },
}, async ({ modifiedNodeIds, threshold }) => ImpactHandlers.handleGetImpact(codeGraph, modifiedNodeIds, threshold));
server.registerTool("blast_radius", {
    description: "Analyzes the impact of a proposed change using a natural language query. It automatically finds the most impacted node and traces its callers.",
    inputSchema: {
        query: z.string().describe("Natural language description of the change, e.g. 'rename the Graph class'"),
        threshold: z.number().min(0).max(1).default(0.3).describe("Minimum similarity threshold (0-1). Lower = more results.")
    },
}, async ({ query, threshold }) => BlastRadiusHandlers.handleBlastRadius(codeGraph, query, threshold));
server.registerTool("discovery", {
    description: "Analyze the project graph and return the initial context containing top core files, central components, and overall project scale. Useful to orientation after installation.",
    inputSchema: {}
}, async () => DiscoveryHandlers.handleDiscovery(codeGraph));
// Starts the MCP server on stdio transport
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("CodeAtlas MCP Server running on stdio");
}
main().catch(console.error);
