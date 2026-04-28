import { Graph } from "../../core/graph/Graph.js";
export declare const DiscoveryHandlers: {
    handleDiscovery: (graph: Graph) => Promise<{
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
//# sourceMappingURL=discovery.d.ts.map