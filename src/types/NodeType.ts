import { AgentThought } from "./AgentThought";

export type NodeType = {
    file: string;
    function: string;
    method: string;
    class: string;
    import: string;
    user_prompt: string;
    agent_thought: AgentThought;
    tool_call: string;
    tool_result: string;
    code_change: string;
    implementation: string;
    context_lookup: string;
    interface: string;
    module: string;
    exports: string;
}

