import { describe, it, expect, mock } from "bun:test";
import { Project } from "ts-morph";
import { Graph } from "../../core/graph/Graph.js";
import { Edge } from "../../core/graph/models/Edge.js";
import { indexClasses } from "./classes.js";
import { indexFunctions } from "./functions.js";
import { indexImports } from "./imports.js";
import { indexInterfaces } from "./interfaces.js";

// Mock EmbedQuery to avoid loading the real ML model during tests
mock.module("../../core/indexer/embedQuery.js", () => ({
    EmbedQuery: async () => new Array(384).fill(0),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a ts-morph in-memory project with the given source code at /file.ts */
function makeProject(code: string) {
    const project = new Project({ useInMemoryFileSystem: true });
    const sf = project.createSourceFile("/file.ts", code);
    return { project, sf };
}

/** A no-op predicate that always returns true — treats every file as "in-project" */
const alwaysInProject = (_fp: string) => true;

// ---------------------------------------------------------------------------
// indexInterfaces
// ---------------------------------------------------------------------------

describe("indexInterfaces", () => {
    it("adds a node for each interface", () => {
        const { sf } = makeProject(`interface Foo {} interface Bar {}`);
        const g = new Graph();
        g.addNode({ graphType: "Code", id: "/file.ts", type: "file", data: {} });

        indexInterfaces(sf, g);

        expect(g.getNode("/file.ts#Foo")).toBeDefined();
        expect(g.getNode("/file.ts#Foo")?.type).toBe("interface");
        expect(g.getNode("/file.ts#Bar")).toBeDefined();
    });

    it("adds a DEFINES edge from the file to each interface", () => {
        const { sf } = makeProject(`interface Greet {}`);
        const g = new Graph();
        g.addNode({ graphType: "Code", id: "/file.ts", type: "file", data: {} });

        indexInterfaces(sf, g);

        const edges = g.getEdgesFrom("/file.ts");
        expect(edges).toHaveLength(1);
        expect(edges[0].type).toBe("DEFINES");
        expect(edges[0].to).toBe("/file.ts#Greet");
    });

    it("stores the interface name in node data", () => {
        const { sf } = makeProject(`interface MyInterface {}`);
        const g = new Graph();

        indexInterfaces(sf, g);

        const node = g.getNode("/file.ts#MyInterface");
        expect(node?.data.name).toBe("MyInterface");
    });

    it("does nothing when there are no interfaces", () => {
        const { sf } = makeProject(`const x = 1;`);
        const g = new Graph();

        indexInterfaces(sf, g);

        expect(g.nodes.size).toBe(0);
        expect(g.edges).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// indexFunctions
// ---------------------------------------------------------------------------

describe("indexFunctions", () => {
    it("adds a node for each named function", async () => {
        const { sf, project } = makeProject(
            `export function hello() {} export function world() {}`
        );
        const tc = project.getTypeChecker();
        const g = new Graph();
        g.addNode({ graphType: "Code", id: "/file.ts", type: "file", data: {} });

        await indexFunctions(sf, g, tc, alwaysInProject);

        expect(g.getNode("/file.ts#hello")).toBeDefined();
        expect(g.getNode("/file.ts#hello")?.type).toBe("function");
        expect(g.getNode("/file.ts#world")).toBeDefined();
    });

    it("adds a DEFINES edge from the file to each function", async () => {
        const { sf, project } = makeProject(`export function greet() {}`);
        const tc = project.getTypeChecker();
        const g = new Graph();
        g.addNode({ graphType: "Code", id: "/file.ts", type: "file", data: {} });

        await indexFunctions(sf, g, tc, alwaysInProject);

        const edges = g.getEdgesFrom("/file.ts");
        expect(edges.some((e: Edge) => e.type === "DEFINES" && e.to === "/file.ts#greet")).toBe(true);
    });

    it("stores the function name in node data", async () => {
        const { sf, project } = makeProject(`function compute() {}`);
        const tc = project.getTypeChecker();
        const g = new Graph();

        await indexFunctions(sf, g, tc, alwaysInProject);

        expect(g.getNode("/file.ts#compute")?.data.name).toBe("compute");
    });

    it("ignores anonymous functions", async () => {
        const { sf, project } = makeProject(`const fn = function() {};`);
        const tc = project.getTypeChecker();
        const g = new Graph();

        await indexFunctions(sf, g, tc, alwaysInProject);

        expect(g.nodes.size).toBe(0);
    });

    it("does nothing when there are no functions", async () => {
        const { sf, project } = makeProject(`const x = 42;`);
        const tc = project.getTypeChecker();
        const g = new Graph();

        await indexFunctions(sf, g, tc, alwaysInProject);

        expect(g.nodes.size).toBe(0);
        expect(g.edges).toHaveLength(0);
    });

    it("adds CALLS edges when a function calls another function in the same file", async () => {
        const { sf, project } = makeProject(
            `export function helper() {}
             export function main() { helper(); }`
        );
        const tc = project.getTypeChecker();
        const g = new Graph();
        g.addNode({ graphType: "Code", id: "/file.ts", type: "file", data: {} });

        await indexFunctions(sf, g, tc, alwaysInProject);

        const edges = g.getEdgesFrom("/file.ts#main");
        const callEdge = edges.find((e: Edge) => e.type === "CALLS");
        expect(callEdge).toBeDefined();
        expect(callEdge?.to).toBe("/file.ts#helper");
    });
});

// ---------------------------------------------------------------------------
// indexClasses
// ---------------------------------------------------------------------------

describe("indexClasses", () => {
    it("adds a node for each class", async () => {
        const { sf, project } = makeProject(`class Dog {} class Cat {}`);
        const tc = project.getTypeChecker();
        const g = new Graph();
        g.addNode({ graphType: "Code", id: "/file.ts", type: "file", data: {} });

        await indexClasses(sf, g, tc, alwaysInProject);

        expect(g.getNode("/file.ts#Dog")?.type).toBe("class");
        expect(g.getNode("/file.ts#Cat")?.type).toBe("class");
    });

    it("adds a DEFINES edge from the file to each class", async () => {
        const { sf, project } = makeProject(`class Animal {}`);
        const tc = project.getTypeChecker();
        const g = new Graph();
        g.addNode({ graphType: "Code", id: "/file.ts", type: "file", data: {} });

        await indexClasses(sf, g, tc, alwaysInProject);

        const edges = g.getEdgesFrom("/file.ts");
        expect(edges.some((e: Edge) => e.type === "DEFINES" && e.to === "/file.ts#Animal")).toBe(true);
    });

    it("adds nodes for each method inside a class", async () => {
        const { sf, project } = makeProject(
            `class MyClass { greet() {} farewell() {} }`
        );
        const tc = project.getTypeChecker();
        const g = new Graph();
        g.addNode({ graphType: "Code", id: "/file.ts", type: "file", data: {} });

        await indexClasses(sf, g, tc, alwaysInProject);

        expect(g.getNode("/file.ts#MyClass.greet")?.type).toBe("method");
        expect(g.getNode("/file.ts#MyClass.farewell")?.type).toBe("method");
    });

    it("adds DEFINES edges from class node to each method", async () => {
        const { sf, project } = makeProject(`class Svc { run() {} }`);
        const tc = project.getTypeChecker();
        const g = new Graph();
        g.addNode({ graphType: "Code", id: "/file.ts", type: "file", data: {} });

        await indexClasses(sf, g, tc, alwaysInProject);

        const classEdges = g.getEdgesFrom("/file.ts#Svc");
        expect(classEdges.some((e: Edge) => e.type === "DEFINES" && e.to === "/file.ts#Svc.run")).toBe(true);
    });

    it("adds IMPLEMENTS edges when a class implements an interface", async () => {
        const { sf, project } = makeProject(
            `interface Runnable {} class Worker implements Runnable {}`
        );
        const tc = project.getTypeChecker();
        const g = new Graph();
        g.addNode({ graphType: "Code", id: "/file.ts", type: "file", data: {} });

        await indexClasses(sf, g, tc, alwaysInProject);

        const classEdges = g.getEdgesFrom("/file.ts#Worker");
        const implEdge = classEdges.find((e: Edge) => e.type === "IMPLEMENTS");
        expect(implEdge).toBeDefined();
        expect(implEdge?.to).toBe("Runnable");
    });

    it("stores class and method name metadata in node data", async () => {
        const { sf, project } = makeProject(`class Foo { bar() {} }`);
        const tc = project.getTypeChecker();
        const g = new Graph();

        await indexClasses(sf, g, tc, alwaysInProject);

        expect(g.getNode("/file.ts#Foo")?.data.name).toBe("Foo");

        const methodNode = g.getNode("/file.ts#Foo.bar");
        expect(methodNode?.data.name).toBe("Foo.bar");
        expect(methodNode?.data.className).toBe("Foo");
        expect(methodNode?.data.methodName).toBe("bar");
    });

    it("does nothing when there are no classes", async () => {
        const { sf, project } = makeProject(`const x = 1;`);
        const tc = project.getTypeChecker();
        const g = new Graph();

        await indexClasses(sf, g, tc, alwaysInProject);

        expect(g.nodes.size).toBe(0);
        expect(g.edges).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// indexImports
// ---------------------------------------------------------------------------

describe("indexImports", () => {
    it("adds an IMPORTS edge for each import declaration", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        project.createSourceFile("/utils.ts", `export const x = 1;`);
        const sf = project.createSourceFile(
            "/main.ts",
            `import { x } from "./utils";`
        );

        const g = new Graph();
        g.addNode({ graphType: "Code", id: "/main.ts", type: "file", data: {} });

        indexImports(sf, g);

        const edges = g.getEdgesFrom("/main.ts");
        expect(edges).toHaveLength(1);
        expect(edges[0].type).toBe("IMPORTS");
        expect(edges[0].to).toBe("/utils.ts");
    });

    it("uses the raw specifier as `to` when the module cannot be resolved", () => {
        const { sf } = makeProject(`import something from "some-external-pkg";`);

        const g = new Graph();
        g.addNode({ graphType: "Code", id: "/file.ts", type: "file", data: {} });

        indexImports(sf, g);

        const edges = g.getEdgesFrom("/file.ts");
        expect(edges).toHaveLength(1);
        expect(edges[0].type).toBe("IMPORTS");
        expect(edges[0].to).toBe("some-external-pkg");
    });

    it("adds one edge per import declaration", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        project.createSourceFile("/a.ts", `export const a = 1;`);
        project.createSourceFile("/b.ts", `export const b = 2;`);
        const sf = project.createSourceFile(
            "/main.ts",
            `import { a } from "./a";\nimport { b } from "./b";`
        );

        const g = new Graph();
        indexImports(sf, g);

        const edges = g.getEdgesFrom("/main.ts");
        expect(edges).toHaveLength(2);
        expect(edges.every((e: Edge) => e.type === "IMPORTS")).toBe(true);
    });

    it("does nothing when there are no imports", () => {
        const { sf } = makeProject(`const x = 42;`);
        const g = new Graph();

        indexImports(sf, g);

        expect(g.edges).toHaveLength(0);
    });
});
