import { addCodeChange, getChangesForFile, getChangesGraph } from "../../graph/changes/changes.js";

export function saveCodeChange(file: string, description: string, diff?: string, thoughtId?: string) {
    const changeId = addCodeChange({ file, description, diff, thoughtId });
    return {
        content: [{
            type: "text" as const,
            text: `✓ Code change recorded. Change ID: ${changeId}\n  File: ${file}\n  Description: ${description}`
        }]
    };
}

export function getFileHistory(file: string) {
    const changes = getChangesForFile(file);

    if (changes.length === 0) {
        return { content: [{ type: "text" as const, text: `No recorded changes for: ${file}` }] };
    }

    const output = changes.map(n =>
        `[${n!.data.timestamp}] ${n!.data.description}${n!.data.diff ? `\n${n!.data.diff}` : ""}`
    ).join("\n\n---\n\n");

    return { content: [{ type: "text" as const, text: output }] };
}

export function getAllChanges() {
    const graph = getChangesGraph();

    if (graph.nodes.size === 0) {
        return { content: [{ type: "text" as const, text: "No code changes recorded yet." }] };
    }

    const changes = Array.from(graph.nodes.values())
        .filter(n => n.type === "code_change")
        .sort((a, b) => a.data.timestamp.localeCompare(b.data.timestamp))
        .map(n =>
            `[${n.data.timestamp}] ${n.data.file}\n  ${n.data.description}`
        );

    return { content: [{ type: "text" as const, text: changes.join("\n\n") }] };
}
