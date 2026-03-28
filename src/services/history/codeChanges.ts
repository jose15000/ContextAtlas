import { Graph } from "../../core/graph/Graph.js";
import { addCodeChange, getChangesForFile, saveChangesGraph } from "../../graph/changes/changes.js";
import { NodeType } from "../../core/graph/models/NodeType.js";
import { SaveCodeChangeRequestDTO } from "../../core/dtos/changes.dto.js";

export function saveCodeChange(changesGraph: Graph, dto: SaveCodeChangeRequestDTO) {
    const changeId = addCodeChange(changesGraph, dto);
    saveChangesGraph(changesGraph);
    return { changeId, file: dto.file, description: dto.description };
}

export function getFileHistory(changesGraph: Graph, nodeType: NodeType, file: string) {
    return getChangesForFile(changesGraph, file, nodeType);
}

export function getAllChanges(changesGraph: Graph) {
    return Array.from(changesGraph.nodes.values())
        .filter(n => n.type === "code_change")
        .sort((a, b) => (a.data.timestamp?.getTime() || 0) - (b.data.timestamp?.getTime() || 0));
}
