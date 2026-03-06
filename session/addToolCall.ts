import { Graph } from "../src/graph/Graph";

export function addToolCall(graph: Graph, tool: string, thought: string) {
    const id = "tool_" + Date.now();

    graph.addNode({
        id: id,
        type: "tool_call",
        data: { tool }
    });

    graph.addEdge({
        from: thought,
        to: id,
        type: "CALLS_TOOL"
    });
}