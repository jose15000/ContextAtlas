import { Graph } from "../../core/graph/Graph.js";
import { Node } from "../../core/graph/models/Node.js";

export function getBugsByFile(graph: Graph, file: string) {
    const matches = Array.from(graph.nodes.values()).filter(n =>
        n.data?.file?.includes(file) && n.data?.reasoning?.thoughtDetails === "bug");

    return matches;
}