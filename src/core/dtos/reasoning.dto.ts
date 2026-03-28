import { ToolCall } from "../graph/models/ToolCall.js";

export interface SaveReasoningRequestDTO {
    prompt: string;
    thoughtDescription: string;
    thoughtDetails: "decision" | "plan" | "observation" | "bug" | "fix" | "test";
    solution: string;
    toolCall: ToolCall;
    agent: string;
    model: string;
    project: string;
    run_id: string;
}
