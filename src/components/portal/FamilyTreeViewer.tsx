"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Background, Controls, ReactFlow, ReactFlowProvider, useReactFlow, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Crosshair, Printer, Search, Users, X } from "lucide-react";
import FamilyNode from "@/components/admin/tree/FamilyNode";
import RelationshipAnalysisModal from "@/components/admin/tree/RelationshipAnalysisModal";
import type { TreeViewData, TreeViewNodeData } from "@/lib/data/tree";
import { NODE_HEIGHT, NODE_WIDTH, getLayoutedElements, toFlow } from "@/lib/tree/layout";

const nodeTypes = { familyMember: FamilyNode };

function Viewer({ tree, myMemberId }: { tree: TreeViewData; myMemberId: string | null }) {
    const router = useRouter();
    const { setCenter } = useReactFlow();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

    const { nodes, edges } = useMemo(() => {
        const flow = toFlow<TreeViewNodeData>(tree);
        return getLayoutedElements(flow.nodes, flow.edges);
    }, [tree]);

    const displayNodes = useMemo(
        () =>
            nodes.map((node) => ({
                ...node,
                selected: node.id === selectedId,
                draggable: false,
                connectable: false,
                data: { ...node.data, onViewDetails: () => router.push(`/portal/members/${node.id}`) },
            })),
        [nodes, selectedId, router],
    );

    const matches = useMemo(() => {
        const q = query.trim();
        if (q.length < 2) return [];
        return nodes.filter((n) => n.data.label.includes(q) || n.data.serialNumber === q).slice(0, 8);
    }, [nodes, query]);

    const focus = (node: Node | undefined) => {
        if (!node) return;
        setSelectedId(node.id);
        setCenter(node.position.x + NODE_WIDTH / 2, node.position.y + NODE_HEIGHT / 2, { zoom: 1.2, duration: 700 });
    };

    const isMine = myMemberId !== null && nodes.some((n) => n.id === myMemberId);

    return (
        <div className="relative h-[calc(100dvh-16rem)] xl:h-[calc(100dvh-12rem)] min-h-[420px] bg-white rounded-2xl border border-line overflow-hidden">
            <div className="absolute top-3 inset-x-3 z-10 flex flex-wrap gap-2 items-start">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="ابحث عن فرد بالاسم أو الرقم..."
                        className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-sm shadow-sm outline-none focus:border-primary"
                    />
                    {matches.length > 0 && (
                        <ul className="absolute top-full mt-1 inset-x-0 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                            {matches.map((n) => (
                                <li key={n.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            focus(n);
                                            setQuery("");
                                        }}
                                        className="w-full text-right px-3 py-2 text-sm hover:bg-gray-50 flex justify-between gap-2"
                                    >
                                        <span className="font-bold truncate">{n.data.label}</span>
                                        {n.data.serialNumber && <span className="text-xs text-gray-400">{n.data.serialNumber}</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {isMine && (
                    <button
                        type="button"
                        onClick={() => focus(nodes.find((n) => n.id === myMemberId))}
                        className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold shadow-sm hover:border-primary"
                    >
                        <Crosshair className="w-4 h-4 text-primary" />
                        موقعي
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => setIsAnalysisOpen(true)}
                    className="flex items-center gap-1.5 bg-primary text-deep rounded-xl px-3 py-2.5 text-sm font-bold shadow-sm hover:bg-primary-light"
                >
                    <Users className="w-4 h-4" />
                    ما صلة القرابة؟
                </button>
                <a
                    href={selectedId ? `/portal/poster?root=${selectedId}` : "/portal/poster"}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold shadow-sm hover:border-primary"
                    title={selectedId ? "طباعة فرع الفرد المحدد" : "طباعة الشجرة كاملة"}
                >
                    <Printer className="w-4 h-4 text-primary-dark" />
                    طباعة
                </a>
                {selectedId && (
                    <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-500"
                        aria-label="إلغاء التحديد"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <ReactFlow
                nodes={displayNodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={(_, node) => setSelectedId(node.id)}
                onPaneClick={() => setSelectedId(null)}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable
                deleteKeyCode={null}
                fitView
                fitViewOptions={{ padding: 0.2, maxZoom: 1.1 }}
                minZoom={0.15}
                maxZoom={2}
                dir="ltr"
                proOptions={{ hideAttribution: true }}
            >
                <Controls showInteractive={false} />
                <Background gap={12} size={1} />
            </ReactFlow>

            <div className="absolute bottom-3 left-3 right-14 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200 flex justify-between items-center text-xs text-gray-500 pointer-events-none">
                <span>عدد الأفراد: {nodes.length}</span>
                <span className="flex gap-3">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> ذكور</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> إناث</span>
                </span>
            </div>

            {isAnalysisOpen && (
                <RelationshipAnalysisModal isOpen onClose={() => setIsAnalysisOpen(false)} nodes={nodes} edges={edges} />
            )}
        </div>
    );
}

/** Read-only family tree for members: pan, zoom, search, open a profile, check a relationship. */
export default function FamilyTreeViewer(props: { tree: TreeViewData; myMemberId: string | null }) {
    return (
        <ReactFlowProvider>
            <Viewer {...props} />
        </ReactFlowProvider>
    );
}
