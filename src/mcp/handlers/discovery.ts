import { Graph } from "../../core/graph/Graph.js";
import { discovery } from "../../graph/discovery/index.js";

export const DiscoveryHandlers = {
    handleDiscovery: async (graph: Graph) => {
        try {
            const result = discovery(graph);
            const output = [
                `=== Project Discovery ===`,
                `Total Nodes: ${result.totalNodes}`,
                `Total Edges: ${result.totalEdges}\n`,
                `--- Top 10 Core Files ---`,
                ...result.topFiles.map((f, i) => `${i + 1}. ${f.file.split("/").pop()} (Score: ${f.score.toFixed(1)}) - ${f.file}`),
                `\n--- Top 10 Core Components ---`,
                ...result.topComponents.map((c, i) => `${i + 1}. [${c.type}] ${c.name} (Score: ${c.score.toFixed(1)}) - ${c.id.split("/").pop()}`)
            ].join("\n");

            return {
                content: [{ type: "text" as const, text: output }]
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: error.message }],
                isError: true
            };
        }
    }
};
