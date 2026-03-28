import { Graph } from "../../core/graph/Graph.js";
import { Node } from "../../core/graph/models/Node.js";
import { NodeType } from "../../core/graph/models/NodeType.js";
import { saveReasoning } from "../../services/history/saveReasoning.js";
import { getBugsByFile } from "../../services/history/getBugsByFile.js";
import { saveCodeChange, getFileHistory, getAllChanges } from "../../services/history/codeChanges.js";
import { SaveReasoningRequestDTO } from "../../core/dtos/reasoning.dto.js";
import { SaveCodeChangeRequestDTO } from "../../core/dtos/changes.dto.js";

function formatNodes(nodes: Node[], emptyMsg: string, formatter: (n: Node) => string) {
    if (nodes.length === 0) {
        return { content: [{ type: "text" as const, text: emptyMsg }] };
    }
    return { content: [{ type: "text" as const, text: nodes.map(formatter).join("\n\n") }] };
}

export const HistoryHandlers = {
    handleSaveReasoning: async (graph: Graph, dto: SaveReasoningRequestDTO) => {
        const { size } = await saveReasoning(graph, dto);
        return { content: [{ type: "text" as const, text: `Reasoning saved (${size} total entries in memory).` }] };
    },

    handleGetBugsByFile: async (graph: Graph, file: string) => {
        const bugs = getBugsByFile(graph, file);
        return formatNodes(
            bugs,
            `No bugs found in '${file}'.`,
            n => `Bug in ${n.data?.file}:\nThought: ${n.data?.reasoning?.thoughtDescription}\nSolution: ${n.data?.reasoning?.solution}`
        );
    },

    handleSaveCodeChange: async (graph: Graph, dto: SaveCodeChangeRequestDTO) => {
        const result = saveCodeChange(graph, dto);
        return {
            content: [{
                type: "text" as const,
                text: `Code change recorded. Change ID: ${result.changeId}\n  File: ${result.file}\n  Description: ${result.description}`
            }]
        };
    },

    handleGetFileHistory: async (graph: Graph, nodeType: NodeType, file: string) => {
        const changes = getFileHistory(graph, nodeType, file);
        return formatNodes(
            changes as Node[],
            `No recorded changes for: ${file}`,
            n => `[${n.data.timestamp?.toISOString() || "unknown"}] ${n.data.description}${n.data.diff ? `\n${n.data.diff}` : ""}`
        );
    },

    handleGetAllChanges: async (graph: Graph) => {
        const changes = getAllChanges(graph);
        return formatNodes(
            changes as Node[],
            "No code changes recorded yet.",
            n => `[${n.data.timestamp?.toISOString() || "unknown"}] ${n.data.file}\n  ${n.data.description}`
        );
    }
};
