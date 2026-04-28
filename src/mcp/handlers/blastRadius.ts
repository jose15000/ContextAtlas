import { Graph } from "../../core/graph/Graph.js";
import { blastRadius } from "../../graph/blastRadius/index.js";

export const BlastRadiusHandlers = {
    handleBlastRadius: async (graph: Graph, query: string, threshold: number) => {
        try {
            const result = await blastRadius(query, threshold, graph);

            if (!result) {
                return { content: [{ type: "text" as const, text: "Nenhum impacto encontrado para a busca." }] };
            }

            let out = `# Analise de Impacto\n`;
            out += `- Nó de maior impacto: ${result.highestNodeId} (Score: ${result.highestScore.toFixed(2)})\n`;

            if (typeof result.traces !== "string" && result.traces.length > 0) {
                out += `\nTrace Callers para ${result.functionName}:\n`;
                for (const t of result.traces) {
                    const callers = t.callers.map(c => c.data?.name || c.id).join(", ");
                    out += `  -> É chamada por: ${callers || "Ninguém internamente"}\n`;
                }
            } else {
                out += `\nTrace: ${result.traces}\n`;
            }

            return {
                content: [{
                    type: "text" as const,
                    text: out
                }]
            };

        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: error.message }],
                isError: true
            };
        }
    }
};
