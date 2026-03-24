import { AgentThought } from "./AgentThought";
import { GraphType } from "./GraphType";
import { NodeMetadata } from "./NodeMetadata";

export interface IReasoning extends NodeMetadata {
    prompt: string;
    thoughtDescription: string;
    thoughtDetails: AgentThought;
    solution: string;
}