import { AgentThought } from "./AgentThought";
import { NodeMetadata } from "./NodeMetadata";
import { ToolCall } from "./ToolCall";
export interface IReasoning extends NodeMetadata {
    prompt: string;
    thoughtDescription: string;
    thoughtDetails: AgentThought;
    toolCall: ToolCall;
    solution: string;
}
//# sourceMappingURL=Reasoning.d.ts.map