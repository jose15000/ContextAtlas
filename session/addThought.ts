import { Graph } from "../src/graph/Graph";

export function addThought(graph: Graph, promptId: string, thought: string) {
    const id = "thought_" + Date.now();

    graph.addNode({
        id: id,
        type: "agent_thought",
        data: { thought }
    });

    graph.addEdge({
        from: promptId,
        to: id,
        type: "GENERATED_BY"
    });
}