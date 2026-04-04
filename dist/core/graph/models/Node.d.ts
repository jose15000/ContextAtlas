import type { GraphType } from "./GraphType";
import type { NodeData } from "./NodeData";
import type { NodeMetadata } from "./NodeMetadata";
import type { NodeType } from "./NodeType";
export type Node = {
    id: string;
    graphType: GraphType;
    type: NodeType;
    metadata?: NodeMetadata;
    data: NodeData;
};
//# sourceMappingURL=Node.d.ts.map