import { Graph } from "../../core/graph/Graph.js";

/**
 * Measures the impact of changes to a set of nodes in the graph.
 * Impact propagates backwards through edges (from dependency to dependent).
 * 
 * @param graph The code graph
 * @param modifiedNodeIds IDs of nodes that were changed
 * @param threshold Minimum impact score to continue propagation (default: 0.01)
 * @returns A Map of nodeId to impact score (0 to 1)
 */
export function measureCodeImpact(
    graph: Graph,
    modifiedNodeIds: string[],
    threshold: number = 0.01
): Map<string, number> {
    const impactScores = new Map<string, number>();
    const queue: string[] = [];

    // Initialize modified nodes with maximum impact
    for (const id of modifiedNodeIds) {
        if (graph.getNode(id)) {
            impactScores.set(id, 1.0);
            queue.push(id);
        }
    }

    let head = 0;
    while (head < queue.length) {
        const nodeId = queue[head++];
        const currentImpact = impactScores.get(nodeId)!;

        // Find nodes that depend on this node (incoming edges)
        const incomingEdges = graph.getEdgesTo(nodeId);

        for (const edge of incomingEdges) {
            const dependentId = edge.from;
            const weight = edge.weight ?? 1.0; // Default weight if not specified
            const edgeImpact = currentImpact * weight;

            if (edgeImpact >= threshold) {
                const existingImpact = impactScores.get(dependentId) || 0;
                
                // Only update and propagate if we found a more significant impact path
                if (edgeImpact > existingImpact) {
                    impactScores.set(dependentId, edgeImpact);
                    queue.push(dependentId);
                }
            }
        }
    }

    return impactScores;
}
