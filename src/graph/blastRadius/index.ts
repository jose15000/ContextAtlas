import { Graph } from "../../core/graph/Graph.js";
import { traceCallers } from "../../services/code/traceCallers.js";
import { semanticSearch } from "../../services/search/semanticSearch.js";
import { measureCodeImpact } from "../impact/index.js";

export async function blastRadius(query: string, threshold: number, graph: Graph) {
    const search = await semanticSearch({ query, graph, limit: 10, threshold })
    const impact = await measureCodeImpact(graph, search.map(s => s.id), threshold);

    if (impact.size === 0) return null;

    const sortEntries = Array.from(impact).sort((a, b) => b[1] - a[1])

    const [highestNodeId, highestScore] = sortEntries[0];

    const highestNode = graph.getNode(highestNodeId);

    if (highestNode && highestNode.type === "function" || highestNode?.type === "method") {
        const functionName = highestNode.data?.name;
        const traces = traceCallers(graph, functionName!);

        return { highestNodeId, highestScore, functionName, traces }
    }

    return { highestNodeId, highestScore, traces: "The biggest impact node isn't a function or method." }
}   