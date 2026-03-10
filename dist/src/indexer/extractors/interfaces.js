export function indexInterfaces(sourceFile, graph) {
    const filePath = sourceFile.getFilePath();
    for (const iface of sourceFile.getInterfaces()) {
        const ifaceName = iface.getName();
        if (!ifaceName)
            continue;
        const ifaceId = `${filePath}#${ifaceName}`;
        graph.addNode({ id: ifaceId, type: "interface", data: { name: ifaceName } });
        graph.addEdge({ from: filePath, to: ifaceId, type: "DEFINES" });
    }
}
