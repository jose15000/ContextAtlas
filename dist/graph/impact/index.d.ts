import type { Graph } from "../../core/graph/Graph.js";
/**
 * Measures the impact of changes to a set of nodes in the graph.
 * Impact propagates backwards through edges (from dependency to dependent).
 *
 * @param graph The code graph
 * @param modifiedNodeIds IDs of nodes that were changed
 * @param threshold Minimum impact score to continue propagation (default: 0.01)
 * @returns A Map of nodeId to impact score (0 to 1)
 */
export declare function measureCodeImpact(graph: Graph, modifiedNodeIds: string[], threshold?: number): Map<string, number>;
//# sourceMappingURL=index.d.ts.map