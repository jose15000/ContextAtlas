import { Graph } from "../src/graph/Graph";

export function addCodeChange(graph: Graph, change: string, thought: string) {

    const id = "codeChange_" + Date.now();
    graph.addNode({
        id: id,
        type: "code_change",
        data: { change }
    })

    graph.addEdge({
        from: thought,
        to: id,
        type: "MODIFIES"
    })

}