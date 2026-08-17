import { HistoryHandlers } from "./mcp/handlers/history.js";
import { SearchHandlers } from "./mcp/handlers/search.js";
import { ImpactHandlers } from "./mcp/handlers/impact.js";
import { BlastRadiusHandlers } from "./mcp/handlers/blastRadius.js";
import { loadOrBuildGraph } from "./services/graph/loadOrBuildGraph.js";
import { loadReasoningGraph } from "./graph/reasoning/reasoningGraph.js";
import { loadChangesGraph } from "./graph/changes/changes.js";
import path from "path";

export class ContextAtlasClient {
    private cachePath: string;

    constructor(projectDir: string = process.cwd()) {
        this.cachePath = path.join(projectDir, "./context/.codeatlas-cache.json");
    }

    async getCodeGraph() {
        return await loadOrBuildGraph(this.cachePath);
    }

    getReasoningGraph() {
        return loadReasoningGraph();
    }

    getChangesGraph() {
        return loadChangesGraph();
    }

    async recordCodeChange(change: {
        file: string;
        description: string;
        agentThought: "decision" | "plan" | "observation" | "bug" | "fix" | "test";
        diff?: string;
        thoughtId?: string;
    }) {
        const graph = this.getChangesGraph();
        return await HistoryHandlers.handleSaveCodeChange(graph, change);
    }

    async recordReasoning(reasoning: {
        prompt: string;
        thoughtDescription: string;
        thoughtDetails: "decision" | "plan" | "observation" | "bug" | "fix" | "test";
        solution: string;
        toolCall: {
            tool: { name: string; description: string };
            result: string;
        };
        agent: string;
        model: string;
        project: string;
        run_id: string;
    }) {
        const graph = this.getReasoningGraph();
        return await HistoryHandlers.handleSaveReasoning(graph, reasoning);
    }

    async findSymbol(symbol: string) {
        const graph = await this.getCodeGraph();
        return await SearchHandlers.handleFindSymbol(graph, symbol);
    }

    async getBlastRadius(query: string, threshold = 0.3) {
        const graph = await this.getCodeGraph();
        return await BlastRadiusHandlers.handleBlastRadius(graph, query, threshold);
    }
}
