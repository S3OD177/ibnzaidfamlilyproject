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
import PrintDialog, { PrintOptions } from './PrintDialog';
import { Printer } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const initialNodes: Node[] = [
    // Gen 1
    { id: '1', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'الجد المؤسس', role: 'الجيل الأول', gender: 'male', status: 'deceased', serial: '001', mobile: '0500000001', birthDate: { day: '1', month: '1', year: '1300', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1380', type: 'Hijri' } } },

    // Gen 2
    { id: '2', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'عبدالله', role: 'الجيل الثاني', gender: 'male', status: 'deceased', serial: '002', mobile: '0500000002', birthDate: { day: '1', month: '1', year: '1330', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1410', type: 'Hijri' } } },
    { id: '3', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'محمد', role: 'الجيل الثاني', gender: 'male', status: 'deceased', serial: '003', mobile: '0500000003', birthDate: { day: '1', month: '1', year: '1335', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1415', type: 'Hijri' } } },
    { id: '7', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'علي', role: 'الجيل الثاني', gender: 'male', status: 'alive', serial: '004', mobile: '0500000004', birthDate: { day: '1', month: '1', year: '1340', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '8', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'فاطمة', role: 'الجيل الثاني', gender: 'female', status: 'alive', serial: '005', mobile: '0500000005', birthDate: { day: '1', month: '1', year: '1342', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '9', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'نورة', role: 'الجيل الثاني', gender: 'female', status: 'deceased', serial: '006', mobile: '0500000006', birthDate: { day: '1', month: '1', year: '1345', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },

    // Gen 3
    { id: '4', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'سارة', role: 'الجيل الثالث', gender: 'female', status: 'alive', serial: '007', mobile: '0500000007', birthDate: { day: '1', month: '1', year: '1360', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '5', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'أحمد', role: 'الجيل الثالث', gender: 'male', status: 'alive', serial: '008', mobile: '0500000008', birthDate: { day: '1', month: '1', year: '1362', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '10', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'منيرة', role: 'الجيل الثالث', gender: 'female', status: 'alive', serial: '009', mobile: '0500000009', birthDate: { day: '1', month: '1', year: '1365', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '11', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'حسن', role: 'الجيل الثالث', gender: 'male', status: 'alive', serial: '010', mobile: '0500000010', birthDate: { day: '1', month: '1', year: '1368', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '6', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'خالد', role: 'الجيل الثالث', gender: 'male', status: 'alive', serial: '011', mobile: '0500000011', birthDate: { day: '1', month: '1', year: '1370', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '12', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'ريم', role: 'الجيل الثالث', gender: 'female', status: 'alive', serial: '012', mobile: '0500000012', birthDate: { day: '1', month: '1', year: '1372', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '13', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'فيصل', role: 'الجيل الثالث', gender: 'male', status: 'deceased', serial: '013', mobile: '0500000013', birthDate: { day: '1', month: '1', year: '1375', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '14', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'سلطان', role: 'الجيل الثالث', gender: 'male', status: 'alive', serial: '014', mobile: '0500000014', birthDate: { day: '1', month: '1', year: '1378', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '15', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'لمى', role: 'الجيل الثالث', gender: 'female', status: 'alive', serial: '015', mobile: '0500000015', birthDate: { day: '1', month: '1', year: '1380', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '16', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'عبدالمحسن', role: 'الجيل الثالث', gender: 'male', status: 'alive', serial: '016', mobile: '0500000016', birthDate: { day: '1', month: '1', year: '1382', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },

    // Gen 4
    { id: '17', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'عمر', role: 'الجيل الرابع', gender: 'male', status: 'alive', serial: '017', mobile: '0500000017', birthDate: { day: '1', month: '1', year: '1390', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '18', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'رشا', role: 'الجيل الرابع', gender: 'female', status: 'alive', serial: '018', mobile: '0500000018', birthDate: { day: '1', month: '1', year: '1392', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '19', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'فهد', role: 'الجيل الرابع', gender: 'male', status: 'alive', serial: '019', mobile: '0500000019', birthDate: { day: '1', month: '1', year: '1395', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '20', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'الجوهرة', role: 'الجيل الرابع', gender: 'female', status: 'alive', serial: '020', mobile: '0500000020', birthDate: { day: '1', month: '1', year: '1398', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '21', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'تركي', role: 'الجيل الرابع', gender: 'male', status: 'alive', serial: '021', mobile: '0500000021', birthDate: { day: '1', month: '1', year: '1400', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '22', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'مشعل', role: 'الجيل الرابع', gender: 'male', status: 'alive', serial: '022', mobile: '0500000022', birthDate: { day: '1', month: '1', year: '1402', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '23', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'لولوة', role: 'الجيل الرابع', gender: 'female', status: 'alive', serial: '023', mobile: '0500000023', birthDate: { day: '1', month: '1', year: '1402', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },

    // Gen 5
    { id: '24', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'سعد', role: 'الجيل الخامس', gender: 'male', status: 'alive', serial: '024', mobile: '0500000024', birthDate: { day: '1', month: '1', year: '1420', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '25', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'دانه', role: 'الجيل الخامس', gender: 'female', status: 'alive', serial: '025', mobile: '0500000025', birthDate: { day: '1', month: '1', year: '1422', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '26', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'سلمان', role: 'الجيل الخامس', gender: 'male', status: 'alive', serial: '026', mobile: '0500000026', birthDate: { day: '1', month: '1', year: '1425', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
    { id: '27', type: 'familyMember', position: { x: 0, y: 0 }, data: { label: 'غادة', role: 'الجيل الخامس', gender: 'female', status: 'alive', serial: '027', mobile: '0500000027', birthDate: { day: '1', month: '1', year: '1428', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } } },
];

const initialEdges: Edge[] = [
    // Gen 1 -> 2
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e1-7', source: '1', target: '7', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e1-8', source: '1', target: '8', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e1-9', source: '1', target: '9', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },

    // Gen 2 -> 3
    { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e2-5', source: '2', target: '5', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e2-10', source: '2', target: '10', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e2-11', source: '2', target: '11', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e3-6', source: '3', target: '6', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e3-12', source: '3', target: '12', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e3-13', source: '3', target: '13', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e7-14', source: '7', target: '14', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e7-15', source: '7', target: '15', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e7-16', source: '7', target: '16', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },

    // Gen 3 -> 4
    { id: 'e5-17', source: '5', target: '17', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e5-18', source: '5', target: '18', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e6-19', source: '6', target: '19', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e6-20', source: '6', target: '20', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e6-21', source: '6', target: '21', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e14-22', source: '14', target: '22', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e14-23', source: '14', target: '23', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },

    // Gen 4 -> 5
    { id: 'e17-24', source: '17', target: '24', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e17-25', source: '17', target: '25', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e19-26', source: '19', target: '26', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
    { id: 'e19-27', source: '19', target: '27', type: 'smoothstep', style: { strokeWidth: 2, stroke: '#cbd5e1' } },
];

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

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
);

const FamilyTreeContent = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
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
        (params: Connection) => setEdges((eds) => addEdge({
            ...params,
            type: 'smoothstep',
            style: { strokeWidth: 2, stroke: '#cbd5e1' }
        }, eds)),
        [setEdges],
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

    const handleUpdateNode = useCallback((data: any, newMembers?: any[]) => {
        if (!selectedNode) return;

        // 1. Update Current Node Data
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return { ...node, data: { ...node.data, ...data } };
                }
                return node;
            })
        );

        // 2. Handle New Members (Adding Children)
        if (newMembers && newMembers.length > 0) {
            const addedNodes: Node[] = [];
            const addedEdges: Edge[] = [];

            newMembers.forEach(member => {
                if (!member.label) return; // Skip empty names
                const newId = `${Date.now()}-${Math.random()}`;

                // Create Node
                addedNodes.push({
                    id: newId,
                    type: 'familyMember',
                    position: { x: 0, y: 0 }, // Position will be fixed by auto-layout
                    data: {
                        label: member.label,
                        gender: member.gender,
                        role: 'الجيل القادم', // Default role
                        status: member.status
                    }
                });

                // Create Edge (Parent -> Child)
                addedEdges.push({
                    id: `e${selectedNode.id}-${newId}`,
                    source: selectedNode.id,
                    target: newId,
                    type: 'smoothstep',
                    style: { strokeWidth: 2, stroke: '#cbd5e1' }
                });
            });

            if (addedNodes.length > 0) {
                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                    [...nodes, ...addedNodes],
                    [...edges, ...addedEdges]
                );
                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
            }
        }

        setIsSidebarOpen(false);
    }, [selectedNode, nodes, edges, setNodes, setEdges]);

    const handleDeleteNode = useCallback(() => {
        if (!selectedNode) return;
        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
        setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
        setIsSidebarOpen(false);
        setSelectedNode(null);
    }, [selectedNode, setNodes, setEdges]);


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
                <span>عدد الأفراد: {nodes.length}</span>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> ذكور</span>
                    <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div> إناث</span>
                </div>
            </div>
        </div>
    );
}

export default function FamilyTreeBuilder() {
    return (
        <ReactFlowProvider>
            <FamilyTreeContent />
        </ReactFlowProvider>
    );
}
