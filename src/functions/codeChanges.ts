import { Graph } from "../graph/Graph.js";
import { addCodeChange, getChangesForFile, saveChangesGraph } from "../graph/changes/changes.js";
import { AgentThought } from "../types/AgentThought.js";
import { NodeType } from "../types/NodeType.js";

export function saveCodeChange(
    changesGraph: Graph,
    file: string,
    agentThought: AgentThought,
    description: string,
    diff?: string,
    thoughtId?: string
) {
    const changeId = addCodeChange(changesGraph, { file, description, agentThought, diff, thoughtId });
    saveChangesGraph(changesGraph);

    return {
        content: [{
            type: "text" as const,
            text: `Code change recorded. Change ID: ${changeId}\n  File: ${file}\n  Description: ${description}`
        }]
    };
}

export function getFileHistory(nodeType: NodeType, file: string) {
    const changes = getChangesForFile(file, nodeType);

    if (changes.length === 0) {
        return { content: [{ type: "text" as const, text: `No recorded changes for: ${file}` }] };
    }

    const output = changes.map(n =>
        `[${n!.data.timestamp?.toISOString() || "unknown"}] ${n!.data.description}${n!.data.diff ? `\n${n!.data.diff}` : ""}`
    ).join("\n\n---\n\n");

    return { content: [{ type: "text" as const, text: output }] };
}

export function getAllChanges(changesGraph: Graph) {
    if (changesGraph.nodes.size === 0) {
        return { content: [{ type: "text" as const, text: "No code changes recorded yet." }] };
    }

    const changes = Array.from(changesGraph.nodes.values())
        .filter(n => n.type === "code_change")
        .sort((a, b) => (a.data.timestamp?.getTime() || 0) - (b.data.timestamp?.getTime() || 0))
        .map(n => `[${n.data.timestamp?.toISOString() || "unknown"}] ${n.data.file}\n  ${n.data.description}`);

    return { content: [{ type: "text" as const, text: changes.join("\n\n") }] };
}
