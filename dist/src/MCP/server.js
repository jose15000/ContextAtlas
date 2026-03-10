#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { buildContextGraph } from "../index.js";
import { saveGraph, loadGraph } from "../graph/persistence.js";
import { addReasoning, getReasoningGraph } from "../graph/reasoning/reasoningGraph.js";
const CACHE_PATH = path.join(process.cwd(), ".codeatlas-cache.json");
function getGraph() {
    const cached = loadGraph(CACHE_PATH);
    if (cached) {
        console.error(`[CodeAtlas] Loaded graph from cache (${cached.nodes.size} nodes, ${cached.edges.length} edges)`);
        return cached;
    }
    console.error("[CodeAtlas] Building graph from source...");
    const graph = buildContextGraph(process.cwd());
    saveGraph(graph, CACHE_PATH);
    console.error(`[CodeAtlas] Graph built and cached (${graph.nodes.size} nodes, ${graph.edges.length} edges)`);
    return graph;
}
const graph = getGraph();
const server = new McpServer({
    name: "CodeAtlas",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});
// ─── find_symbol ─────────────────────────────────────────────────────────────
server.registerTool("find_symbol", {
    description: "Find code entities (functions, classes, methods, interfaces) by name. Returns id, type, file and name.",
    inputSchema: {
        symbol: z.string().describe("Name or partial name to search for, e.g. 'login'")
    }
}, async ({ symbol }) => {
    const lower = symbol.toLowerCase();
    const matches = Array.from(graph.nodes.values()).filter(n => {
        const name = n.data?.name || n.id;
        return name.toLowerCase().includes(lower);
    });
    if (matches.length === 0) {
        return { content: [{ type: "text", text: `No symbols found matching '${symbol}'.` }] };
    }
    const lines = matches.slice(0, 50).map(n => {
        const file = n.id.split("#")[0];
        return `[${n.type}] ${n.data?.name ?? n.id}\n  id:   ${n.id}\n  file: ${file}`;
    });
    return { content: [{ type: "text", text: lines.join("\n\n") }] };
});
// ─── expand_node ─────────────────────────────────────────────────────────────
server.registerTool("expand_node", {
    description: "Expand the graph around a node via BFS up to a given depth. Returns all reachable nodes and edges.",
    inputSchema: {
        nodeId: z.string().describe("Full node id, e.g. '/abs/path/file.ts#MyClass.myMethod'"),
        depth: z.number().int().min(1).max(5).describe("Number of hops to expand (1-5)")
    }
}, async ({ nodeId, depth }) => {
    if (!graph.nodes.has(nodeId)) {
        return {
            content: [{ type: "text", text: `Node '${nodeId}' not found in the graph.` }],
            isError: true
        };
    }
    const visitedNodes = new Set([nodeId]);
    const subEdges = [];
    let frontier = [nodeId];
    for (let i = 0; i < depth; i++) {
        const nextFrontier = [];
        for (const current of frontier) {
            const edges = graph.edges.filter(e => e.from === current || e.to === current);
            for (const edge of edges) {
                subEdges.push(edge);
                for (const neighbor of [edge.from, edge.to]) {
                    if (!visitedNodes.has(neighbor)) {
                        visitedNodes.add(neighbor);
                        nextFrontier.push(neighbor);
                        if (visitedNodes.size >= 200)
                            break;
                    }
                }
            }
            if (visitedNodes.size >= 200)
                break;
        }
        frontier = nextFrontier;
        if (frontier.length === 0)
            break;
    }
    const subNodes = Array.from(visitedNodes)
        .map(id => graph.nodes.get(id))
        .filter(Boolean);
    // Deduplicate edges
    const uniqueEdges = Array.from(new Map(subEdges.map(e => [`${e.from}→${e.type}→${e.to}`, e])).values());
    const nodesText = subNodes.map(n => `[${n.type}] ${n.data?.name ?? n.id} (${n.id})`).join("\n");
    const edgesText = uniqueEdges.map(e => `${e.from.split("#").pop()} --[${e.type}]--> ${e.to.split("#").pop()}`).join("\n");
    const output = `=== Nodes (${subNodes.length}) ===\n${nodesText}\n\n=== Edges (${uniqueEdges.length}) ===\n${edgesText}`;
    return { content: [{ type: "text", text: output }] };
});
// ─── get_file ─────────────────────────────────────────────────────────────────
server.registerTool("get_file", {
    description: "Returns the text content of a specified file.",
    inputSchema: {
        path: z.string().describe("Path to the file to read")
    }
}, async ({ path: filePath }) => {
    try {
        const absolutePath = path.resolve(process.cwd(), filePath);
        const content = fs.readFileSync(absolutePath, "utf-8");
        return { content: [{ type: "text", text: content }] };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error reading file: ${String(error)}` }],
            isError: true
        };
    }
});
// ─── trace_callers ────────────────────────────────────────────────────────────
server.registerTool("trace_callers", {
    description: "Finds all functions/methods that call the given function. Shows who depends on this.",
    inputSchema: {
        functionName: z.string().describe("Name of the function or method to trace callers for")
    }
}, async ({ functionName }) => {
    const targetNodes = Array.from(graph.nodes.values()).filter(n => (n.type === "function" || n.type === "method") && n.data.name === functionName);
    if (targetNodes.length === 0) {
        return {
            content: [{ type: "text", text: `Symbol '${functionName}' not found in the graph.` }],
            isError: true
        };
    }
    const results = targetNodes.map(targetNode => {
        const callers = graph.edges.filter(e => e.type === "CALLS" && e.to === targetNode.id);
        const callerIds = Array.from(new Set(callers.map(e => e.from)));
        const lines = callerIds.map(id => {
            const n = graph.nodes.get(id);
            return `  - ${n?.data?.name ?? id} [${n?.type ?? "?"}] (${id})`;
        });
        return `${targetNode.id}:\n${lines.length ? lines.join("\n") : "  (no callers found)"}`;
    });
    return { content: [{ type: "text", text: results.join("\n\n") }] };
});
// ─── trace_callees ────────────────────────────────────────────────────────────
server.registerTool("trace_callees", {
    description: "Finds all functions/methods called by the given node. Shows what this depends on.",
    inputSchema: {
        nodeId: z.string().describe("Full node ID of the function/method (e.g. '/abs/path/file.ts#MyClass.myMethod')")
    }
}, async ({ nodeId }) => {
    const callees = graph.edges.filter(e => e.type === "CALLS" && e.from === nodeId);
    const calleeIds = Array.from(new Set(callees.map(e => e.to)));
    if (calleeIds.length === 0) {
        return { content: [{ type: "text", text: "No callees found." }] };
    }
    const lines = calleeIds.map(id => {
        const n = graph.nodes.get(id);
        return `  - ${n?.data?.name ?? id} [${n?.type ?? "?"}] (${id})`;
    });
    return { content: [{ type: "text", text: lines.join("\n") }] };
});
// ─── search_symbol ────────────────────────────────────────────────────────────
server.registerTool("search_symbol", {
    description: "Search for code symbols by partial name. Returns id, type and name.",
    inputSchema: {
        query: z.string().describe("Partial string query to search for")
    }
}, async ({ query }) => {
    const lowerQuery = query.toLowerCase();
    const matches = Array.from(graph.nodes.values()).filter(n => {
        const name = n.data?.name || n.id;
        return name.toLowerCase().includes(lowerQuery);
    });
    const output = matches.slice(0, 50).map(n => `${n.data?.name || 'Unnamed'} (${n.type}) — ${n.id}`).join("\n");
    return { content: [{ type: "text", text: output || "No symbols matched the query." }] };
});
server.registerTool("create_reasoning_context_graph", {
    description: "Creates a context graph for agent's reasoning. Returns user prompt, agent thought and solutuion.",
    inputSchema: {
        prompt: z.string().describe("user prompt"),
        thought: z.string().describe("agent thought"),
        solution: z.string().describe("agent's solution from thought and user prompt.")
    }
}, async ({ prompt, thought, solution }) => {
    addReasoning(prompt, thought, solution);
    const graph = getReasoningGraph();
    const serialized = {
        nodes: Array.from(graph.nodes.values()),
        edges: graph.edges,
    };
    return { content: [{ type: "text", text: JSON.stringify(serialized, null, 2) }] };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("CodeAtlas MCP Server running on stdio");
}
main().catch(console.error);
