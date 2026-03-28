import { Graph } from "../graph/Graph";

export interface semanticData {
    query: string,
    graph: Graph,
    limit: number,
    threshold: number
}
