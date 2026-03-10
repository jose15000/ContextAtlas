import { buildContextGraph } from "./src/index";
const graph = buildContextGraph(process.cwd());
console.log(`Generated Graph with ${graph.nodes.size} nodes and ${graph.edges.length} edges.`);
const sampleNode = Array.from(graph.nodes.values()).find(n => n.type === 'file');
console.log("Sample Node (File):", sampleNode);
console.log("Sample Edge from that File:", graph.getEdgesFrom(sampleNode.id));
