import path from "path";
import { Graph } from "../Graph.js";
import { saveGraph, loadGraph } from "../persistence.js";

const CHANGES_CACHE = ".codeatlas-changes.json";

export interface CodeChangeEntry {
    file: string;
    description: string;
    diff?: string;
    promptId?: string;
    thoughtId?: string;
}

export function addCodeChange(entry: CodeChangeEntry): string {
    const cachePath = path.join(process.cwd(), CHANGES_CACHE);
    const graph = loadGraph(cachePath) ?? new Graph();

    const timestamp = new Date().toISOString();
    const changeId = crypto.randomUUID();

    graph.addNode({
        id: changeId,
        type: "code_change",
        data: {
            file: entry.file,
            description: entry.description,
            diff: entry.diff ?? null,
            timestamp
        }
    });

    // Link change → modified file (if file node exists in code graph, we reference by path)
    graph.addEdge({
        from: changeId,
        to: entry.file,
        type: "MODIFIES"
    });

    // Optionally link to the reasoning that caused this change
    if (entry.thoughtId) {
        graph.addEdge({
            from: entry.thoughtId,
            to: changeId,
            type: "MODIFIES"
        });
    }

    saveGraph(graph, cachePath);
    return changeId;
}

export function getChangesGraph(): Graph {
    const cachePath = path.join(process.cwd(), CHANGES_CACHE);
    return loadGraph(cachePath) ?? new Graph();
}

export function getChangesForFile(file: string): ReturnType<Graph["nodes"]["get"]>[] {
    const graph = getChangesGraph();
    return Array.from(graph.nodes.values()).filter(
        n => n.type === "code_change" && n.data.file === file
    );
}