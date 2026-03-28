import { SourceFile } from "ts-morph";
import { Graph } from "../../core/graph/Graph.js";

export function indexInterfaces(sourceFile: SourceFile, graph: Graph) {
    const filePath = sourceFile.getFilePath();

    for (const iface of sourceFile.getInterfaces()) {
        const ifaceName = iface.getName();
        if (!ifaceName) continue;

        const ifaceId = `${filePath}#${ifaceName}`;
        graph.addNode({ graphType: "Code", id: ifaceId, type: "interface", data: { name: ifaceName } });
        graph.addEdge({ from: filePath, to: ifaceId, type: "DEFINES" });
    }
}
