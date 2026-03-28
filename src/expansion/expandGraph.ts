import { Graph } from "../core/graph/Graph.js";
import { Node } from "../core/graph/models/Node.js";
import { Edge } from "../core/graph/models/Edge.js";

export interface ExpandResult {
    nodes: Node[];
    edges: Edge[];
}

/**
 * BFS expansion from a starting node.
 * @param bidirectional - if true, follows edges in both directions (from OR to).
 *                        if false, only follows outgoing edges.
 * @param maxNodes      - safety cap to avoid huge output (default 200)
 */
export function expandGraph(
    graph: Graph,
    start: string,
    depth = 2,
    bidirectional = false,
    maxNodes = 200
): ExpandResult {
    const visitedNodes = new Set<string>([start]);
    const subEdges: Edge[] = [];
    let frontier = [start];

    if (depth === 0) {
        const adjacentEdges = bidirectional
            ? graph.edges.filter((e: Edge) => e.from === start || e.to === start)
            : graph.getEdgesFrom(start);
        subEdges.push(...adjacentEdges);
    }

    for (let i = 0; i < depth; i++) {
        const nextFrontier: string[] = [];

        for (const current of frontier) {
            const adjacentEdges = bidirectional
                ? graph.edges.filter((e: Edge) => e.from === current || e.to === current)
                : graph.getEdgesFrom(current);

            for (const edge of adjacentEdges) {
                subEdges.push(edge);
                const neighbors = bidirectional ? [edge.from, edge.to] : [edge.to];
                for (const neighbor of neighbors) {
                    if (!visitedNodes.has(neighbor)) {
                        visitedNodes.add(neighbor);
                        nextFrontier.push(neighbor);
                        if (visitedNodes.size >= maxNodes) break;
                    }
                }
            }
            if (visitedNodes.size >= maxNodes) break;
        }

        frontier = nextFrontier;
        if (frontier.length === 0) break;
    }

    const nodes = Array.from(visitedNodes)
        .map(id => graph.nodes.get(id))
        .filter(Boolean) as Node[];

    // Deduplicate edges
    const edges = Array.from(
        new Map(subEdges.map(e => [`${e.from}→${e.type}→${e.to}`, e])).values()
    );

    return { nodes, edges };
}