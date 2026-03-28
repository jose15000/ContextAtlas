import { Graph } from "../../core/graph/Graph.js";
import { expandGraph } from "../../expansion/expandGraph.js";

export function expandNode(graph: Graph, nodeId: string, depth: number) {
    if (!graph.nodes.has(nodeId)) {
        throw new Error(`Node '${nodeId}' not found in the graph.`);
    }

    return expandGraph(graph, nodeId, depth, true);
}
