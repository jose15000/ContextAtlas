import type { Graph } from "../../core/graph/Graph.js";
import { measureCodeImpact } from "../../graph/impact/index.js";

export const ImpactHandlers = {
    handleGetImpact: async (graph: Graph, modifiedNodeIds: string[], threshold?: number) => {
        const impactMap = measureCodeImpact(graph, modifiedNodeIds, threshold);

        if (impactMap.size === 0) {
            return {
                content: [{
                    type: "text" as const,
                    text: "No significant impact found for the specified nodes and threshold."
                }]
            };
        }

        const sortedEntries = Array.from(impactMap.entries())
            .sort((a, b) => b[1] - a[1]);

        const impactLines = sortedEntries.map(([nodeId, score]) => {
            const node = graph.getNode(nodeId);
            const name = node?.data?.name ?? nodeId;
            const type = node?.type ?? "UNKNOWN";
            const file = nodeId.split("#")[0];
            
            return `[${type}] ${name}\n  id:     ${nodeId}\n  file:   ${file}\n  impact: ${score.toFixed(4)}`;
        });

        const outputText = `Impact Analysis Results (Total: ${impactMap.size} nodes affected):\n\n${impactLines.join("\n\n")}`;

        return {
            content: [{
                type: "text" as const,
                text: outputText
            }]
        };
    }
};
