import { Graph } from "../../core/graph/Graph.js";
export declare const BlastRadiusHandlers: {
    handleBlastRadius: (graph: Graph, query: string, threshold: number) => Promise<{
        content: {
            type: "text";
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: "text";
            text: any;
        }[];
        isError: boolean;
    }>;
};
//# sourceMappingURL=blastRadius.d.ts.map