import { Graph } from "../graph/Graph.js";

export function expandGraph(graph: Graph, start: string, depth = 2) {
    const visited = new Set<string>();
    const queue = [{ id: start, level: 0 }];

    const nodes = [];
    const edges = [];

    while (queue.length) {
        const { id, level } = queue.shift()!

        if (visited.has(id)) continue
        visited.add(id);

        const node = graph.getNode(id);

        if (node) nodes.push(node);

        const outEdges = graph.getEdgesFrom(id)

        for (const edge of outEdges) {
            edges.push(edge);

            if (level > depth) {
                queue.push({ id: edge.to, level: level + 1 })
            }
        }
    }

    return { nodes, edges };

}