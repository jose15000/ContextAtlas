import fs from "fs";
function isBarrelFile(content) {
    const line = content.split("\n").map(l => l.trim());
    const meaningful = line.filter(l => l && !l.startsWith("//") && !l.startsWith("/*"));
    return meaningful.every(line => line.startsWith("export") && line.includes("from")
        || (line.includes("*")));
}
export function discovery(graph) {
    const scores = new Map();
    const edgeWeight = {
        CALLS: 3,
        IMPORTS: 2,
        IMPLEMENTS: 2,
        DEFINES: 0.5,
    };
    for (const edge of graph.edges) {
        const weight = edgeWeight[edge.type] || 0.1;
        const toNodeId = edge.to;
        const currentScore = scores.get(toNodeId) || 0;
        scores.set(toNodeId, currentScore + weight);
    }
    const fileScores = new Map();
    const topComponents = [];
    for (const [nodeId, score] of scores.entries()) {
        const node = graph.nodes.get(nodeId);
        if (!node)
            continue;
        const filePath = nodeId.split("#")[0];
        if (filePath) {
            try {
                const fileContent = node.data?.text || fs.readFileSync(filePath, "utf-8");
                const findExports = isBarrelFile(fileContent);
                const isTypeFile = filePath.endsWith(".d.ts") || filePath.toLowerCase().endsWith("types.ts");
                if (findExports || isTypeFile)
                    continue;
            }
            catch (err) {
                console.error(`Error reading file ${filePath}:`, err);
                continue;
            }
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
    const sortedFiles = Array.from(fileScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([file, score]) => ({ file, score }));
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
