import { NodeData } from "../types/NodeData";

export type SemanticSearchResult = {
    data: NodeData;
    score: number;
    id: string;
    type: string;
}