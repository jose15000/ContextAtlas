import { GraphType } from "./GraphType";
import { NodeData } from "./NodeData";
import { NodeMetadata } from "./NodeMetadata";
import { NodeType } from "./NodeType";
export type Node = {
    id: string;
    graphType: GraphType;
    type: NodeType;
    metadata?: NodeMetadata;
    data: NodeData;
};
//# sourceMappingURL=Node.d.ts.map