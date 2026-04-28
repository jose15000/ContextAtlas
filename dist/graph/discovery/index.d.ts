import { Graph } from "../../core/graph/Graph.js";
export declare function discovery(graph: Graph): {
    topFiles: {
        file: string;
        score: number;
    }[];
    topComponents: {
        id: string;
        score: number;
        name: string;
        type: string;
    }[];
    totalNodes: number;
    totalEdges: number;
};
//# sourceMappingURL=index.d.ts.map