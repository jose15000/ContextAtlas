export declare class ContextAtlasClient {
    private cachePath;
    constructor(projectDir?: string);
    getCodeGraph(): Promise<import("./index.js").Graph>;
    getReasoningGraph(): import("./index.js").Graph;
    getChangesGraph(): import("./index.js").Graph;
    recordCodeChange(change: {
        file: string;
        description: string;
        agentThought: "decision" | "plan" | "observation" | "bug" | "fix" | "test";
        diff?: string;
        thoughtId?: string;
    }): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    recordReasoning(reasoning: {
        prompt: string;
        thoughtDescription: string;
        thoughtDetails: "decision" | "plan" | "observation" | "bug" | "fix" | "test";
        solution: string;
        toolCall: {
            tool: {
                name: string;
                description: string;
            };
            result: string;
        };
        agent: string;
        model: string;
        project: string;
        run_id: string;
    }): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    findSymbol(symbol: string): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
    getBlastRadius(query: string, threshold?: number): Promise<{
        content: {
            type: "text";
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: "text";
            text: any;
        }[];
        isError: boolean;
    }>;
}
//# sourceMappingURL=client.d.ts.map