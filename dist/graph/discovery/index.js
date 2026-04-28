export function discovery(graph) {
    const scores = new Map();
    // Give priority mapped by edge usage
    const edgeWeight = {
        CALLS: 3,
        IMPORTS: 2,
        IMPLEMENTS: 2,
        DEFINES: 0.5
    };
    // Calculate score per node based on incoming edges
    for (const edge of graph.edges) {
        // give at least 0.1 for any edge even if unmapped
        const weight = edgeWeight[edge.type] || 0.1;
        const toNodeId = edge.to;
        const currentScore = scores.get(toNodeId) || 0;
        scores.set(toNodeId, currentScore + weight);
    }
    const fileScores = new Map();
    const topComponents = [];
    // Aggregate by file and also track top components
    for (const [nodeId, score] of scores.entries()) {
        const node = graph.nodes.get(nodeId);
        if (!node)
            continue;
        const filePath = nodeId.split("#")[0];
        if (filePath) {
            const currentFileScore = fileScores.get(filePath) || 0;
            fileScores.set(filePath, currentFileScore + score);
        }
        if (node.type !== "file") {
            topComponents.push({
                id: nodeId,
                score,
                name: node.data?.name || nodeId,
                type: node.type
            });
        }
    }
    // Sort files descending
    const sortedFiles = Array.from(fileScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([file, score]) => ({ file, score }));
    // Sort components descending
    const sortedComponents = topComponents
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    return {
        topFiles: sortedFiles,
        topComponents: sortedComponents,
        totalNodes: graph.nodes.size,
        totalEdges: graph.edges.length
    };
}
