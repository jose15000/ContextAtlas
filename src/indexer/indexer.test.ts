import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs";
import path from "path";
import os from "os";
import { indexerProject } from "./indexer.js";

let tmpDir: string;

beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codeatlas-indexer-test-"));
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("indexerProject", () => {
    it("returns an empty array for an empty directory", () => {
        const files = indexerProject(tmpDir);
        expect(files).toHaveLength(0);
    });

    it("returns flat files in a directory", () => {
        fs.writeFileSync(path.join(tmpDir, "a.ts"), "");
        fs.writeFileSync(path.join(tmpDir, "b.ts"), "");

        const files = indexerProject(tmpDir);
        expect(files).toHaveLength(2);

        const basenames = files.map((f) => path.basename(f));
        expect(basenames).toContain("a.ts");
        expect(basenames).toContain("b.ts");
    });

    it("walks into nested sub-directories recursively", () => {
        const sub = path.join(tmpDir, "sub");
        const deep = path.join(sub, "deep");
        fs.mkdirSync(deep, { recursive: true });

        fs.writeFileSync(path.join(tmpDir, "root.ts"), "");
        fs.writeFileSync(path.join(sub, "middle.ts"), "");
        fs.writeFileSync(path.join(deep, "leaf.ts"), "");

        const files = indexerProject(tmpDir);
        expect(files).toHaveLength(3);

        const basenames = files.map((f) => path.basename(f));
        expect(basenames).toContain("root.ts");
        expect(basenames).toContain("middle.ts");
        expect(basenames).toContain("leaf.ts");
    });

    it("returns absolute paths", () => {
        fs.writeFileSync(path.join(tmpDir, "foo.ts"), "");

        const files = indexerProject(tmpDir);
        expect(files).toHaveLength(1);
        expect(path.isAbsolute(files[0])).toBe(true);
    });

    it("includes files of any extension, not just .ts", () => {
        fs.writeFileSync(path.join(tmpDir, "index.ts"), "");
        fs.writeFileSync(path.join(tmpDir, "README.md"), "");
        fs.writeFileSync(path.join(tmpDir, "data.json"), "");

        const files = indexerProject(tmpDir);
        const exts = files.map((f) => path.extname(f));
        expect(exts).toContain(".ts");
        expect(exts).toContain(".md");
        expect(exts).toContain(".json");
    });

    it("never includes directory paths — only files", () => {
        const sub = path.join(tmpDir, "subdir");
        fs.mkdirSync(sub);
        fs.writeFileSync(path.join(sub, "file.ts"), "");

        const files = indexerProject(tmpDir);
        for (const f of files) {
            expect(fs.statSync(f).isFile()).toBe(true);
        }
    });
});
