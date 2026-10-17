"use client";

import React, { useCallback, useMemo, useState } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    Position,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import FamilyNode from './FamilyNode';
import MemberModal from './MemberModal';
import { Plus, RotateCcw } from 'lucide-react';
import RelationshipAnalysisModal from './RelationshipAnalysisModal';
import ExportControls from './ExportControls';
import type { TreeData } from '@/lib/data/tree';
import { addMembers, deleteMember, linkMembers, updateMember } from '@/app/portal/admin/tree/actions';
import PrintDialog, { PrintOptions } from './PrintDialog';
import { Printer } from 'lucide-react';
import Link from 'next/link';
import { unwrap } from '@/lib/action-result';

const EDGE_STYLE = { strokeWidth: 2, stroke: '#cbd5e1' };

function toFlow(tree: TreeData): { nodes: Node[]; edges: Edge[] } {
    return {
        nodes: tree.nodes.map((n) => ({ id: n.id, type: 'familyMember', position: { x: 0, y: 0 }, data: { ...n.data } })),
        edges: tree.edges.map((e) => ({ id: e.id, source: e.source, target: e.target, type: 'smoothstep', style: EDGE_STYLE })),
    };
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 180;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';

    // Clear the graph before layout
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 120, // Horizontal spacing between siblings
        ranksep: 180, // Vertical spacing between generations
        ranker: 'tight-tree', // Best for hierarchical tree layouts
        align: undefined, // Let dagre handle alignment automatically for balance
        marginx: 80,
        marginy: 80,
        edgesep: 50 // Spacing between edges
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: newNodes, edges };
};

const FamilyTreeContent = ({ initialTree }: { initialTree: TreeData }) => {
    const initial = useMemo(() => {
        const flow = toFlow(initialTree);
        return getLayoutedElements(flow.nodes, flow.edges);
    }, [initialTree]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
    const [saveState, setSaveState] = useState<{ status: 'idle' | 'saving' | 'saved' | 'error'; message?: string }>({ status: 'idle' });

    // Runs a server action and reports progress in the footer bar.
    const persist = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
        setSaveState({ status: 'saving' });
        try {
            const result = await action();
            setSaveState({ status: 'saved' });
            return result;
        } catch (error) {
            setSaveState({ status: 'error', message: error instanceof Error ? error.message : 'تعذر الحفظ' });
            return undefined;
        }
    }, []);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [nodeRelatives, setNodeRelatives] = useState<any>(null); // Store calculated relatives
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [modalTab, setModalTab] = useState<'info' | 'add' | 'edit'>('info');
    const [subtreeRootId, setSubtreeRootId] = useState<string | null>(null);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

    // Print State
    const [printOptions, setPrintOptions] = useState<PrintOptions | null>(null);

    const handlePrint = (options: PrintOptions) => {
        setPrintOptions(options);

        // Apply temporary classes for printing based on options
        const container = document.querySelector('.react-flow');
        if (container) {
            container.classList.add('printing-mode');
            if (!options.showPhotos) container.classList.add('hide-photos');
            if (!options.showDetails) container.classList.add('hide-details');
            if (!options.showDeceasedStatus) container.classList.add('hide-deceased');

            // Set scale
            // (element.style.transform = scale...) logic handled by CSS or separate view var if needed
            // For now, we rely on browser print scale or css zoom
        }

        setTimeout(() => {
            window.print();

            // Cleanup
            if (container) {
                container.classList.remove('printing-mode', 'hide-photos', 'hide-details', 'hide-deceased');
            }
        }, 500);
    };
    const { setCenter, fitView } = useReactFlow();

    const nodeTypes = useMemo(() => ({ familyMember: FamilyNode }), []);

    const onConnect = useCallback(
        async (params: Connection) => {
            if (!params.source || !params.target) return;
            const link = await persist(() => unwrap(linkMembers(params.source!, params.target!)));
            if (!link) return;
            setEdges((eds) => addEdge({ ...params, id: link.id, type: 'smoothstep', style: EDGE_STYLE }, eds));
        },
        [setEdges, persist],
    );

    const getRelatives = useCallback((node: Node) => {
        const children = edges
            .filter(e => e.source === node.id)
            .map(e => nodes.find(n => n.id === e.target))
            .filter(n => n)
            .map(n => ({ id: n!.id, label: n!.data.label, gender: n!.data.gender, birthDate: n!.data.birthDate }));

        const parents = edges
            .filter(e => e.target === node.id)
            .map(e => nodes.find(n => n.id === e.source))
            .filter(n => n)
            .map(n => ({ id: n!.id, label: n!.data.label, gender: n!.data.gender }));

        const parentIds = edges.filter(e => e.target === node.id).map(e => e.source);
        const siblingIds = new Set<string>();
        parentIds.forEach(pid => {
            edges
                .filter(e => e.source === pid && e.target !== node.id)
                .forEach(e => siblingIds.add(e.target));
        });

        const siblings = Array.from(siblingIds)
            .map(id => nodes.find(n => n.id === id))
            .filter(n => n)
            .map(n => ({ id: n!.id, label: n!.data.label, gender: n!.data.gender }));

        return { children, parents, siblings };
    }, [nodes, edges]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        const relatives = getRelatives(node);
        setSelectedNode(node);
        setNodeRelatives(relatives);
        // Modal is NOT opened on node click anymore to allow canvas interaction with expanded state
    }, [getRelatives]);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setNodeRelatives(null);
    }, []);

    const handleUpdateNode = useCallback(async (data: any, newMembers?: any[]) => {
        // 1. Save the selected member's edits (the add form passes newMembers and edits nothing)
        if (selectedNode && newMembers === undefined) {
            const saved = await persist(() => unwrap(updateMember(selectedNode.id, data)));
            if (!saved) return;
            setNodes((nds) => nds.map((node) => (node.id === selectedNode.id ? { ...node, data: { ...node.data, ...saved } } : node)));
        }

        // 2. Add new members: children of the selected member, or new roots when none is selected
        const toAdd = (newMembers ?? [])
            .filter((member) => member?.label?.trim())
            .map((member) => ({ ...member, role: member.role ?? 'الجيل القادم' }));
        if (toAdd.length > 0) {
            const created = await persist(() => unwrap(addMembers(selectedNode?.id ?? null, toAdd)));
            if (!created) return;
            const addedNodes: Node[] = created.map((c) => ({ id: c.id, type: 'familyMember', position: { x: 0, y: 0 }, data: { ...c.data } }));
            const addedEdges: Edge[] = created
                .filter((c) => c.parentId)
                .map((c) => ({ id: `e${c.parentId}-${c.id}`, source: c.parentId!, target: c.id, type: 'smoothstep', style: EDGE_STYLE }));
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                [...nodes, ...addedNodes],
                [...edges, ...addedEdges]
            );
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        }

        setIsSidebarOpen(false);
    }, [selectedNode, nodes, edges, setNodes, setEdges, persist]);

    const handleDeleteNode = useCallback(async () => {
        if (!selectedNode) return;
        const done = await persist(async () => { await unwrap(deleteMember(selectedNode.id)); return true; });
        if (!done) return;
        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
        setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
        setIsSidebarOpen(false);
        setSelectedNode(null);
    }, [selectedNode, setNodes, setEdges, persist]);


    const onLayout = useCallback(() => {
        // Clear previous graph state
        dagreGraph.setGraph({});
        dagreGraph.nodes().forEach(n => dagreGraph.removeNode(n));

        const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
            nodes,
            edges
        );
        setNodes(newNodes);
        setEdges(newEdges);
        // Ensure view fits new layout with padding
        setTimeout(() => fitView({ duration: 800, padding: 0.15 }), 150);
    }, [nodes, edges, setNodes, setEdges, fitView]);

    const handleViewInTree = useCallback(() => {
        if (!selectedNode) return;
        setSubtreeRootId(selectedNode.id);
        setIsSidebarOpen(false);
        // Small delay to allow filter to apply before centering
        setTimeout(() => {
            setCenter(
                selectedNode.position.x + nodeWidth / 2,
                selectedNode.position.y + nodeHeight / 2,
                { zoom: 1.5, duration: 800 }
            );
        }, 50);
    }, [selectedNode, setCenter]);

    // Filter nodes and edges for subtree mode
    const { filteredNodes, filteredEdges } = useMemo(() => {
        if (!subtreeRootId) return { filteredNodes: nodes, filteredEdges: edges };

        const childIds = new Set(edges.filter(e => e.source === subtreeRootId).map(e => e.target));
        const visibleNodeIds = new Set([subtreeRootId, ...Array.from(childIds)]);

        return {
            filteredNodes: nodes.filter(n => visibleNodeIds.has(n.id)),
            filteredEdges: edges.filter(e => e.source === subtreeRootId && visibleNodeIds.has(e.target))
        };
    }, [nodes, edges, subtreeRootId]);

    // Update nodes with callbacks and selection state
    const nodesWithCallbacks = useMemo(() => {
        return filteredNodes.map(node => ({
            ...node,
            selected: selectedNode?.id === node.id,
            data: {
                ...node.data,
                onAddMember: () => {
                    const relatives = getRelatives(node);
                    setNodeRelatives(relatives);
                    setSelectedNode(node);
                    setModalTab('add');
                    setIsSidebarOpen(true);
                },
                onViewDetails: () => {
                    const relatives = getRelatives(node);
                    setNodeRelatives(relatives);
                    setSelectedNode(node);
                    setModalTab('edit'); // Now opens the "edit card" as requested
                    setIsSidebarOpen(true);
                }
            }
        }));
    }, [filteredNodes, edges, getRelatives, selectedNode]);

    return (
        <div className="h-[calc(100vh-140px)] w-full bg-gray-50 relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={onLayout}
                    className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 text-[#111814] font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                    <RotateCcw className="w-4 h-4" />
                    إعادة توزيع
                </button>
                <div className="h-6 w-px bg-gray-300 mx-2" />
                <button
                    onClick={() => setIsPrintDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-primary/30 transition-all shadow-sm"
                >
                    <Printer className="w-4 h-4" />
                    <span>طباعة</span>
                </button>

                <ExportControls nodes={nodes} edges={edges} />
                <button
                    onClick={() => {
                        setSelectedNode(null);
                        setModalTab('add');
                        setIsSidebarOpen(true);
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-lg shadow-sm font-bold text-sm flex items-center gap-2 hover:bg-primary-dark transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    إضافة فرد
                </button>
                <button
                    onClick={() => setIsAnalysisOpen(true)}
                    className="bg-white border border-primary text-primary px-4 py-2 rounded-lg shadow-sm font-bold text-sm flex items-center gap-2 hover:bg-primary/5 transition-colors cursor-pointer"
                >
                    تحليل صلة القرابة
                </button>
                {subtreeRootId && (
                    <button
                        onClick={() => {
                            setSubtreeRootId(null);
                            setSelectedNode(null);
                        }}
                        className="bg-accent text-white px-4 py-2 rounded-lg shadow-sm font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-colors cursor-pointer"
                    >
                        <span>العودة للشجرة الكاملة</span>
                    </button>
                )}
            </div>

            <ReactFlow
                nodes={nodesWithCallbacks}
                edges={filteredEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                onPaneClick={onPaneClick}
                deleteKeyCode={null}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    style: { strokeWidth: 2, stroke: '#cbd5e1' }
                }}
                fitView
                fitViewOptions={{ padding: 0.2, duration: 800, maxZoom: 1.2 }}
                dir="ltr"
                className="bg-white"
                minZoom={0.2}
                maxZoom={2}
                connectionLineStyle={{ strokeWidth: 2, stroke: '#cbd5e1' }}
                proOptions={{ hideAttribution: true }}
            >
                <Controls />
                <MiniMap />
                <Background gap={12} size={1} />
            </ReactFlow>

            <MemberModal
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                data={selectedNode ? { ...selectedNode.data, relatives: nodeRelatives } as any : null}
                onSave={handleUpdateNode}
                onDelete={handleDeleteNode}
                onViewInTree={handleViewInTree}
                initialTab={modalTab}
            />

            {/* Relationship Analysis Modal */}
            <RelationshipAnalysisModal
                isOpen={isAnalysisOpen}
                onClose={() => setIsAnalysisOpen(false)}
                nodes={nodes}
                edges={edges}
            />

            <PrintDialog
                isOpen={isPrintDialogOpen}
                onClose={() => setIsPrintDialogOpen(false)}
                onPrint={handlePrint}
            />

            <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-lg border border-gray-200 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-3">
                    <span>عدد الأفراد: {nodes.length}</span>
                    {saveState.status === 'saving' && <span className="text-blue-600 font-bold">جارٍ الحفظ...</span>}
                    {saveState.status === 'saved' && <span className="text-green-600 font-bold">تم الحفظ</span>}
                    {saveState.status === 'error' && <span className="text-red-600 font-bold">لم يتم الحفظ: {saveState.message}</span>}
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> ذكور</span>
                    <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div> إناث</span>
                </div>
            </div>
        </div>
    );
}

export default function FamilyTreeBuilder({ initialTree }: { initialTree: TreeData }) {
    return (
        <ReactFlowProvider>
            <FamilyTreeContent initialTree={initialTree} />
        </ReactFlowProvider>
    );
}
