
import { Graph } from "../graph/Graph.js";
import { NodeData } from "../graph/models/NodeData.js";

export interface SemanticSearchRequestDTO {
    query: string;
    graph: Graph;
    limit: number;
    threshold: number;
}

export interface SearchResultDTO {
    id: string;
    type: string;
    score: number;
    data: NodeData;
}
