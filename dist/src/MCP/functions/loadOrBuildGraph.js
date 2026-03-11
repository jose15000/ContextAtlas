import fs from "fs";
import path from "path";
import { buildContextGraph } from "../../index.js";
import { saveGraph, loadGraph } from "../../graph/persistence.js";
const EXCLUDED_DIRS = ["node_modules", "dist", ".next", ".cache", ".git"];
function getNewestSourceMtime(dir) {
    let newest = 0;
    function walk(current) {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) {
                if (!EXCLUDED_DIRS.includes(entry.name))
                    walk(full);
            }
            else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
                const mtime = fs.statSync(full).mtimeMs;
                if (mtime > newest)
                    newest = mtime;
            }
        }
    }
    walk(dir);
    return newest;
}
function isCacheStale(cachePath, dir) {
    if (!fs.existsSync(cachePath))
        return true;
    const cacheMtime = fs.statSync(cachePath).mtimeMs;
    return getNewestSourceMtime(dir) > cacheMtime;
}
export function loadOrBuildGraph(cachePath) {
    const stale = isCacheStale(cachePath, process.cwd());
    const cached = !stale ? loadGraph(cachePath) : null;
    if (cached) {
        console.error(`[CodeAtlas] Cache is up-to-date (${cached.nodes.size} nodes, ${cached.edges.length} edges)`);
        return cached;
    }
    if (stale && fs.existsSync(cachePath)) {
        console.error("[CodeAtlas] Source files changed — rebuilding graph...");
    }
    else {
        console.error("[CodeAtlas] No cache found — building graph from source...");
    }
    const graph = buildContextGraph(process.cwd());
    saveGraph(graph, cachePath);
    console.error(`[CodeAtlas] Graph built and cached (${graph.nodes.size} nodes, ${graph.edges.length} edges)`);
    return graph;
}
