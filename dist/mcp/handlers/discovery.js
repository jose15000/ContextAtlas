import { discovery } from "../../graph/discovery/index.js";
export const DiscoveryHandlers = {
    handleDiscovery: async (graph) => {
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
                content: [{ type: "text", text: output }]
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: error.message }],
                isError: true
            };
        }
    }
};
