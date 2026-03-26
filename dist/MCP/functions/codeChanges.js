import { addCodeChange, getChangesForFile, saveChangesGraph } from "../../graph/changes/changes.js";
export function saveCodeChange(changesGraph, file, agentThought, description, diff, thoughtId) {
    const changeId = addCodeChange(changesGraph, { file, description, agentThought, diff, thoughtId });
    saveChangesGraph(changesGraph);
    return {
        content: [{
                type: "text",
                text: `Code change recorded. Change ID: ${changeId}\n  File: ${file}\n  Description: ${description}`
            }]
    };
}
export function getFileHistory(nodeType, file) {
    const changes = getChangesForFile(file, nodeType);
    if (changes.length === 0) {
        return { content: [{ type: "text", text: `No recorded changes for: ${file}` }] };
    }
    const output = changes.map(n => `[${n.data.timestamp?.toISOString() || "unknown"}] ${n.data.description}${n.data.diff ? `\n${n.data.diff}` : ""}`).join("\n\n---\n\n");
    return { content: [{ type: "text", text: output }] };
}
export function getAllChanges(changesGraph) {
    if (changesGraph.nodes.size === 0) {
        return { content: [{ type: "text", text: "No code changes recorded yet." }] };
    }
    const changes = Array.from(changesGraph.nodes.values())
        .filter(n => n.type === "code_change")
        .sort((a, b) => (a.data.timestamp?.getTime() || 0) - (b.data.timestamp?.getTime() || 0))
        .map(n => `[${n.data.timestamp?.toISOString() || "unknown"}] ${n.data.file}\n  ${n.data.description}`);
    return { content: [{ type: "text", text: changes.join("\n\n") }] };
}
