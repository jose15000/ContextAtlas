import { Graph } from "../../core/graph/Graph.js";
import { searchSymbol } from "../../services/search/searchSymbol.js";
import { findSymbol } from "../../services/search/findSymbol.js";
import { semanticSearch } from "../../services/search/semanticSearch.js";

function formatNodeList(nodes: any[], formatLine: (n: any) => string, emptyMessage: string) {
    if (nodes.length === 0) {
        return { content: [{ type: "text" as const, text: emptyMessage }] };
    }
    const output = nodes.map(formatLine).join("\n\n");
    return { content: [{ type: "text" as const, text: output }] };
}

export const SearchHandlers = {
    handleSearchSymbol: async (graph: Graph, query: string) => {
        const matches = searchSymbol(graph, query);
        return formatNodeList(
            matches,
            n => `${n.data?.name || "Unnamed"} (${n.type}) — ${n.id}`,
            "No symbols matched the query."
        );
    },

    handleFindSymbol: async (graph: Graph, symbol: string) => {
        const matches = findSymbol(graph, symbol);
        return formatNodeList(
            matches,
            n => `[${n.type}] ${n.data?.name ?? n.id}\n  id:   ${n.id}\n  file: ${n.id.split("#")[0]}`,
            `No symbols found matching '${symbol}'.`
        );
    },

    handleSemanticSearch: async (graph: Graph, query: string, limit: number, threshold: number) => {
        const results = await semanticSearch({ query, graph, limit, threshold });
        return formatNodeList(
            results,
            r => `[${r.type}] ${r.data.name ?? r.id}\n  id:    ${r.id}\n  file:  ${r.id.split("#")[0]}\n  score: ${r.score.toFixed(4)}`,
            `No semantic results found for '${query}'.`
        );
    }
};
