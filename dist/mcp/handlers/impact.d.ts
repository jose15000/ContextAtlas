import type { Graph } from "../../core/graph/Graph.js";
export declare const ImpactHandlers: {
    handleGetImpact: (graph: Graph, modifiedNodeIds: string[], threshold?: number) => Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=impact.d.ts.map