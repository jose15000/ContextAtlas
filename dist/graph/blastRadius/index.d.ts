import { Graph } from "../../core/graph/Graph.js";
export declare function blastRadius(query: string, threshold: number, graph: Graph): Promise<{
    highestNodeId: string;
    highestScore: number;
    functionName: string | undefined;
    traces: import("../../services/code/traceCallers.js").TraceResult[];
} | {
    highestNodeId: string;
    highestScore: number;
    traces: string;
    functionName?: undefined;
} | null>;
//# sourceMappingURL=index.d.ts.map