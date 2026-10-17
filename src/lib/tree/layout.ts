import dagre from 'dagre';
import { Position, type Edge, type Node } from '@xyflow/react';

// Top-down layout of the family tree, shared by the admin editor and the members' viewer.

export const EDGE_STYLE = { strokeWidth: 2, stroke: '#cbd5e1' };

export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 80;

export function toFlow<T extends Record<string, unknown>>(tree: {
    nodes: { id: string; data: object }[];
    edges: { id: string; source: string; target: string }[];
}): { nodes: Node<T>[]; edges: Edge[] } {
    return {
        nodes: tree.nodes.map((n) => ({ id: n.id, type: 'familyMember', position: { x: 0, y: 0 }, data: { ...n.data } as T })),
        edges: tree.edges.map((e) => ({ id: e.id, source: e.source, target: e.target, type: 'smoothstep', style: EDGE_STYLE })),
    };
}

export function getLayoutedElements<N extends Node>(nodes: N[], edges: Edge[], direction = 'TB') {
    const isHorizontal = direction === 'LR';
    const graph = new dagre.graphlib.Graph();
    graph.setDefaultEdgeLabel(() => ({}));
    graph.setGraph({
        rankdir: direction,
        nodesep: 120, // Horizontal spacing between siblings
        ranksep: 180, // Vertical spacing between generations
        ranker: 'tight-tree', // Best for hierarchical tree layouts
        marginx: 80,
        marginy: 80,
        edgesep: 50, // Spacing between edges
    });

    nodes.forEach((node) => graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
    edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
    dagre.layout(graph);

    const newNodes = nodes.map((node) => {
        const position = graph.node(node.id);
        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: { x: position.x - NODE_WIDTH / 2, y: position.y - NODE_HEIGHT / 2 },
        };
    });

    return { nodes: newNodes, edges };
}
