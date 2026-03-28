import { AgentThought } from "../graph/models/AgentThought.js";

export interface SaveCodeChangeRequestDTO {
    file: string;
    description: string;
    agentThought: AgentThought;
    diff?: string;
    thoughtId?: string;
}
