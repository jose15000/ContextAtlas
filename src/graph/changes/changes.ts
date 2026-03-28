import path from "path";
import { Graph } from "../../core/graph/Graph.js";
import { saveGraph, loadGraph } from "../persistence.js";
import { NodeType } from "../../core/graph/models/NodeType.js";
import { AgentThought } from "../../core/graph/models/AgentThought.js";

const CHANGES_CACHE = "./context/codeatlas-changes.json";

export interface CodeChangeEntry {
    file: string;
    description: string;
    agentThought: AgentThought
    diff?: string;
    thoughtId?: string;
}

export function loadChangesGraph(): Graph {
    const cachePath = path.join(process.cwd(), CHANGES_CACHE);
    return loadGraph(cachePath) ?? new Graph();
}

export function saveChangesGraph(graph: Graph): void {
    const cachePath = path.join(process.cwd(), CHANGES_CACHE);
    saveGraph(graph, cachePath);
}

export function addCodeChange(graph: Graph, entry: CodeChangeEntry): string {
    const timestamp = new Date();
    const changeId = crypto.randomUUID();

    graph.addNode({
        graphType: "Code",
        id: changeId,
        type: "code_change",
        data: { file: entry.file, agentThought: entry.agentThought, description: entry.description, diff: entry.diff, timestamp }
    });

    graph.addEdge({ from: changeId, to: entry.file, type: "MODIFIES" });

    if (entry.thoughtId) {
        graph.addEdge({ from: entry.thoughtId, to: changeId, type: "MODIFIES" });
    }

    return changeId;
}

export function getChangesForFile(graph: Graph, file: string, nodeType: NodeType) {
    return Array.from(graph.nodes.values()).filter(
        n => n.type === nodeType && n.data.file === file
    );
}
