import { Graph } from "../../core/graph/Graph.js";
import { discovery } from "../../graph/discovery/index.js";

function createOnboardingInstructions(discoveryOutput: string) {
    const prompt = `
    You are onboarding a developer into a codebase.

Based on the following key files and components:

${discoveryOutput}

Your job:
1. Identify the architecture style (if unclear, say so)
2. Explain the main runtime flow of the application
3. Describe responsibilities of each core module
4. Identify entrypoints
5. Highlight critical parts of the system
6. Point out potential risks or complexity hotspots

Rules:
- Do NOT assume best practices without evidence
- If something is unclear, explicitly say it
- Focus on behavior, not just structure.`
    return prompt;
}

export const onboardingHandler = {
    HandleOnboarding: async (graph: Graph) => {
        const getTopFiles = discovery(graph);
        const discoveryOutput = JSON.stringify(getTopFiles, null, 2);
        const response = createOnboardingInstructions(discoveryOutput);
        return {
            content: [{ type: "text" as const, text: response }]
        };
    },
}