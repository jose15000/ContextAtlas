import { Graph } from "../../core/graph/Graph.js";
import { Node } from "../../core/graph/models/Node.js";
import { traceCallers, TraceResult } from "../../services/code/traceCallers.js";
import { traceCallees } from "../../services/code/traceCallees.js";
import { getFile } from "../../services/code/getFile.js";

export const CodeHandlers = {
    handleTraceCallers: async (graph: Graph, functionName: string) => {
        try {
            const results = traceCallers(graph, functionName);
            const outputText = results.map((r: TraceResult) => {
                const lines = r.callers.map(n => `  - ${n.data?.name ?? n.id} [${n.type}] (${n.id})`);
                return `${r.target.id}:\n${lines.length ? lines.join("\n") : "  (no callers found)"}`;
            }).join("\n\n");

            return { content: [{ type: "text" as const, text: outputText }] };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: error.message }],
                isError: true
            };
        }
    },

    handleTraceCallees: async (graph: Graph, nodeId: string) => {
        const callees = traceCallees(graph, nodeId);
        if (callees.length === 0) {
            return { content: [{ type: "text" as const, text: "No callees found." }] };
        }
        const lines = callees.map((n: Node) => `  - ${n.data?.name ?? n.id} [${n.type}] (${n.id})`);
        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    },

    handleGetFile: async (filePath: string) => {
        try {
            const content = getFile(filePath);
            return { content: [{ type: "text" as const, text: content }] };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: error.message }],
                isError: true
            };
        }
    }
};
