import { Graph } from "../src/graph/Graph";

export function addToolCall(graph: Graph, tool: string, thoughtId: string) {
    const id = crypto.randomUUID();

    graph.addNode({
        id,
        type: "tool_call",
        data: { tool }
    });

    graph.addEdge({
        from: thoughtId,
        to: id,
        type: "CALLS_TOOL"
    });

    return id;
}