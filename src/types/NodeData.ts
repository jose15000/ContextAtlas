import { IReasoning } from "./Reasoning";
import { ToolCall } from "./ToolCall";

export type NodeData = {
    file?: string;
    path?: string;
    name?: string;
    text?: string;
    timestamp?: Date;
    reasoning?: IReasoning;
    toolCall?: ToolCall;
    diff?: string;
    description?: string;
    className?: string;
    methodName?: string
}