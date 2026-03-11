import { NodeType } from "./NodeType";

export type Node = {
    id: string;
    type: NodeType;
    data: any;
}