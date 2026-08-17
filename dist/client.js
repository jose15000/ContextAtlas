import { HistoryHandlers } from "./mcp/handlers/history.js";
import { SearchHandlers } from "./mcp/handlers/search.js";
import { BlastRadiusHandlers } from "./mcp/handlers/blastRadius.js";
import { loadOrBuildGraph } from "./services/graph/loadOrBuildGraph.js";
import { loadReasoningGraph } from "./graph/reasoning/reasoningGraph.js";
import { loadChangesGraph } from "./graph/changes/changes.js";
import path from "path";
export class ContextAtlasClient {
    constructor(projectDir = process.cwd()) {
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
    async recordCodeChange(change) {
        const graph = this.getChangesGraph();
        return await HistoryHandlers.handleSaveCodeChange(graph, change);
    }
    async recordReasoning(reasoning) {
        const graph = this.getReasoningGraph();
        return await HistoryHandlers.handleSaveReasoning(graph, reasoning);
    }
    async findSymbol(symbol) {
        const graph = await this.getCodeGraph();
        return await SearchHandlers.handleFindSymbol(graph, symbol);
    }
    async getBlastRadius(query, threshold = 0.3) {
        const graph = await this.getCodeGraph();
        return await BlastRadiusHandlers.handleBlastRadius(graph, query, threshold);
    }
}
