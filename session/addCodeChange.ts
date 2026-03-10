import { Graph } from "../src/graph/Graph";

export function addCodeChange(graph: Graph, change: string, thoughtId: string) {
    const id = crypto.randomUUID();

    graph.addNode({
        id,
        type: "code_change",
        data: { change }
    });

    graph.addEdge({
        from: thoughtId,
        to: id,
        type: "MODIFIES"
    });

    return id;
}