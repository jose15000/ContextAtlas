import { Graph } from "../src/graph/Graph";

export function addThought(graph: Graph, promptId: string, thought: string) {
    const id = crypto.randomUUID();

    graph.addNode({
        id,
        type: "agent_thought",
        data: { thought }
    });

    graph.addEdge({
        from: promptId,
        to: id,
        type: "THINKS"
    });

    return id;
}