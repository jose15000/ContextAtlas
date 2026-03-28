import { Graph } from "../../graph/Graph.js";
import { IReasoning } from "../../types/Reasoning.js";
export declare function saveReasoning(reasoningGraph: Graph, reasoning: IReasoning): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
//# sourceMappingURL=saveReasoning.d.ts.map