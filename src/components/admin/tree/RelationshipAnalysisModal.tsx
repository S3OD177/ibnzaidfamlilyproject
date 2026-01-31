"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { X, Heart, ArrowRightLeft, ShieldCheck, RotateCcw, Key } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface RelationshipAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: Node[];
    edges: Edge[];
}

const RelationshipAnalysisModal: React.FC<RelationshipAnalysisModalProps> = ({ isOpen, onClose, nodes, edges }) => {
    const [person1Id, setPerson1Id] = useState<string | null>(null);
    const [person2Id, setPerson2Id] = useState<string | null>(null);
    const [search1, setSearch1] = useState('');
    const [search2, setSearch2] = useState('');
    const [showResults, setShowResults] = useState(false);

    // Reset state when modal opens or closes
    useEffect(() => {
        if (!isOpen) {
            setPerson1Id(null);
            setPerson2Id(null);
            setSearch1('');
            setSearch2('');
            setShowResults(false);
        }
    }, [isOpen]);

    const performSearch = (query: string) => {
        if (!query) return [];
        const q = query.toLowerCase();
        return nodes.filter(n => {
            const data = n.data as any;
            return (
                data.label?.toLowerCase().includes(q) ||
                data.mobile?.includes(q) ||
                data.serial?.includes(q)
            );
        }).slice(0, 5);
    };

    const handleSwap = () => {
        const id1 = person1Id;
        const id2 = person2Id;
        const s1 = search1;
        const s2 = search2;

        setPerson1Id(id2);
        setPerson2Id(id1);
        setSearch1(s2);
        setSearch2(s1);
        setShowResults(false);
    };

    const filteredNodes1 = useMemo(() => performSearch(search1), [nodes, search1]);
    const filteredNodes2 = useMemo(() => performSearch(search2), [nodes, search2]);

    const person1 = nodes.find(n => n.id === person1Id);
    const person2 = nodes.find(n => n.id === person2Id);

    // Function to generate full lineage name
    const getFullLineageName = (nodeId: string | null): string => {
        if (!nodeId) return "";
        const path: string[] = [];
        let currentId: string | undefined = nodeId;
        let lastNodeGender: string | null = null;

        let depth = 0;
        while (currentId && depth < 6) {
            const node = nodes.find(n => n.id === currentId);
            if (node) {
                const label = (node.data as any).label;
                const gender = (node.data as any).gender;

                if (path.length === 0) {
                    path.push(label);
                } else {
                    const connector = lastNodeGender === 'female' ? "بنت" : "بن";
                    path.push(`${connector} ${label}`);
                }
                lastNodeGender = gender;
            }
            const edge = edges.find(e => e.target === currentId);
            currentId = edge?.source;
            depth++;
        }
        return path.join(" ");
    };

    const person1FullName = useMemo(() => getFullLineageName(person1Id), [person1Id, nodes, edges]);
    const person2FullName = useMemo(() => getFullLineageName(person2Id), [person2Id, nodes, edges]);

    const getRelationshipName = (d1: number, d2: number, gender1: string, gender2: string) => {
        const isMale = gender1 === 'male';

        if (d1 === 0 && d2 === 0) return "نفس الشخص";

        // Linear Ancestry
        if (d1 === 0) {
            if (d2 === 1) return isMale ? "والد" : "والدة";
            if (d2 === 2) return isMale ? "جد" : "جدة";
            if (d2 === 3) return isMale ? "جد والد" : "جدة والد";
            return `${isMale ? "جد" : "جدة"} أعـلـى (${d2} أجيال)`;
        }
        if (d2 === 0) {
            if (d1 === 1) return isMale ? "ابن" : "بنت";
            if (d1 === 2) return isMale ? "حفيد" : "حفيدة";
            if (d1 === 3) return isMale ? "حفيد حفيد" : "حفيدة حفيدة";
            return `${isMale ? "حفيد" : "حفيدة"} بـعـيد (${d1} أجيال)`;
        }

        // Horizontal (Siblings)
        if (d1 === 1 && d2 === 1) return isMale ? "أخ مباشر" : "أخت مباشرة";

        // Uncles / Aunts (Gen 1)
        if (d1 === 1) {
            if (d2 === 2) return isMale ? "عم مباشر" : "عمة مباشرة";
            if (d2 === 3) return isMale ? "عم الوالد" : "عمة الوالد";
            return `${isMale ? "عم" : "عمة"} لأجداد بعيدين`;
        }

        // Nephews / Nieces
        if (d2 === 1) {
            if (d1 === 2) return isMale ? "ابن أخ / أخت" : "بنت أخ / أخت";
            if (d1 === 3) return isMale ? "حفيد أخ / أخت" : "حفيدة أخ / أخت";
            return `${isMale ? "سليل" : "سليلة"} أخ / أخت`;
        }

        // Cousins (Gen 2+)
        if (d1 === 2 && d2 === 2) return isMale ? "ابن عم مباشر" : "بنت عم مباشرة";
        if (d1 === 3 && d2 === 3) return isMale ? "ابن عم (درجة ثانية)" : "بنت عم (درجة ثانية)";

        if (d1 === 2 && d2 === 3) return isMale ? "ابن عم الوالد" : "بنت عم الوالد";
        if (d1 === 3 && d2 === 2) return isMale ? "ابن ابن عم" : "بنت ابن عم";

        const term = isMale ? "قريب عائلي" : "قريبة عائلية";
        const gap = Math.abs(d1 - d2);
        const generationMatch = d1 === d2 ? "من نفس الجيل" : `بفارق ${gap} أجيال`;

        return `${term} (${generationMatch})`;
    };

    const getPathToRoot = (nodeId: string): string[] => {
        const path: string[] = [];
        let currentId: string | undefined = nodeId;
        while (currentId) {
            path.push(currentId);
            const edge = edges.find(e => e.target === currentId);
            currentId = edge?.source;
        }
        return path;
    };

    const analysisResult = useMemo(() => {
        if (!person1Id || !person2Id || !person1 || !person2) return null;
        if (person1Id === person2Id) {
            return { type: 'same', commonAncestor: person1Id, path1: [person1Id], path2: [person2Id], distance1: 0, distance2: 0, relation: "نفس الشخص" };
        }

        const path1 = getPathToRoot(person1Id);
        const path2 = getPathToRoot(person2Id);

        let commonAncestor: string | null = null;
        for (const id of path1) {
            if (path2.includes(id)) {
                commonAncestor = id;
                break;
            }
        }

        if (!commonAncestor) return { type: 'none' };

        const subPath1 = path1.slice(0, path1.indexOf(commonAncestor) + 1).reverse();
        const subPath2 = path2.slice(0, path2.indexOf(commonAncestor) + 1).reverse();
        const d1 = subPath1.length - 1;
        const d2 = subPath2.length - 1;

        const relation = getRelationshipName(
            d1, d2,
            (person1.data as any).gender,
            (person2.data as any).gender
        );

        return {
            type: 'related',
            commonAncestor,
            path1: subPath1,
            path2: subPath2,
            distance1: d1,
            distance2: d2,
            relation
        };
    }, [person1Id, person2Id, edges, person1, person2]);

    if (!isOpen) return null;

    const p1Gender = (person1?.data as any)?.gender;
    const pronoun = p1Gender === 'female' ? 'هي' : 'هو';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-lg" onClick={onClose} />

            <div className="relative bg-[#fafafa] rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
                {/* Header */}
                <div className="px-8 py-5 flex justify-between items-center relative z-10 border-b border-gray-100/50 bg-white/50">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold text-gray-900">محلل الأنساب الحديث</h2>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Enterprise Lineage Intelligence</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-100/50 hover:bg-gray-200 rounded-xl transition-all active:scale-95">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar relative z-10">

                    {!showResults && (
                        <div className="grid grid-cols-1 gap-6 relative animate-in fade-in zoom-in-95 duration-300">
                            {/* Person 1 Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide px-1">الطرف الأول (الأساسي)</label>
                                <div className="relative group">
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="بحث بالاسم أو الرقم السلسلي..."
                                        className="w-full pr-12 pl-4 py-4 bg-white border border-gray-100 rounded-xl focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all text-base font-medium shadow-sm"
                                        value={search1}
                                        onChange={(e) => { setSearch1(e.target.value); if (person1Id) setPerson1Id(null); }}
                                    />
                                    {filteredNodes1.length > 0 && !person1Id && (
                                        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden p-1.5 space-y-0.5 animate-in slide-in-from-top-3 duration-200">
                                            {filteredNodes1.map(node => (
                                                <button
                                                    key={node.id}
                                                    className="w-full text-right px-4 py-3 hover:bg-primary/5 rounded-lg text-sm transition-all flex flex-col"
                                                    onClick={() => { setPerson1Id(node.id); setSearch1((node.data as any).label); }}
                                                >
                                                    <span className="font-bold text-gray-900">{(node.data as any).label}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium tracking-wide">رقم التوثيق: {(node.data as any).serial}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {person1 && (
                                    <div className="flex items-center gap-4 px-4 py-4 bg-white rounded-xl border border-primary/20 shadow-sm animate-in zoom-in-95 duration-200">
                                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-primary/20">
                                            {(person1.data as any).label[0]}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-base font-bold text-gray-900 truncate">{person1FullName}</span>
                                            <span className="text-[9px] text-primary/60 font-medium tracking-wider">{(person1.data as any).serial}</span>
                                        </div>
                                        <button
                                            onClick={() => { setPerson1Id(null); setSearch1(''); }}
                                            className="mr-auto w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Switch Button */}
                            <div className="flex justify-center -my-4 relative z-10">
                                <button
                                    onClick={handleSwap}
                                    title="تبديل أطراف التحليل"
                                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-lg hover:bg-gray-50 hover:border-primary/20 hover:scale-110 active:scale-95 transition-all text-gray-400 hover:text-primary"
                                >
                                    <ArrowRightLeft className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Person 2 Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide px-1">الطرف الثاني (المرتبط)</label>
                                <div className="relative group">
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="بحث بالاسم أو الرقم السلسلي..."
                                        className="w-full pr-12 pl-4 py-4 bg-white border border-gray-100 rounded-xl focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all text-base font-medium shadow-sm"
                                        value={search2}
                                        onChange={(e) => { setSearch2(e.target.value); if (person2Id) setPerson2Id(null); }}
                                    />
                                    {filteredNodes2.length > 0 && !person2Id && (
                                        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden p-1.5 space-y-0.5 animate-in slide-in-from-top-3 duration-200">
                                            {filteredNodes2.map(node => (
                                                <button
                                                    key={node.id}
                                                    className="w-full text-right px-4 py-3 hover:bg-primary/5 rounded-lg text-sm transition-all flex flex-col"
                                                    onClick={() => { setPerson2Id(node.id); setSearch2((node.data as any).label); }}
                                                >
                                                    <span className="font-bold text-gray-900">{(node.data as any).label}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium tracking-wide">رقم التوثيق: {(node.data as any).serial}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {person2 && (
                                    <div className="flex items-center gap-4 px-4 py-4 bg-white rounded-xl border border-primary/20 shadow-sm animate-in zoom-in-95 duration-200">
                                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-primary/20">
                                            {(person2.data as any).label[0]}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-base font-bold text-gray-900 truncate">{person2FullName}</span>
                                            <span className="text-[9px] text-primary/60 font-medium tracking-wider">{(person2.data as any).serial}</span>
                                        </div>
                                        <button
                                            onClick={() => { setPerson2Id(null); setSearch2(''); }}
                                            className="mr-auto w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!showResults && (
                        <button
                            onClick={() => setShowResults(true)}
                            disabled={!person1Id || !person2Id}
                            className="w-full py-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold shadow-xl hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all text-base flex items-center justify-center gap-3"
                        >
                            <Key className="w-5 h-5 text-primary" />
                            بـدء الـتـحـلـيـل الـعـائـلـي
                        </button>
                    )}

                    {showResults && analysisResult && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">

                            {/* Detailed Results Badge */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">تقرير التسلسل</span>
                                </div>
                                <button
                                    onClick={() => setShowResults(false)}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    تغيير
                                </button>
                            </div>

                            {/* Main Result Panel */}
                            <div className="relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100 text-center overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />

                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                                        <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
                                        <span className="text-[9px] font-bold text-primary uppercase tracking-wide">توصيف القرابة</span>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                                            {analysisResult.relation}
                                        </h3>
                                        <p className="text-sm text-gray-400 font-medium">
                                            تم تحديد صلة القرابة بنجاح
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-4">
                                        <div className="flex-1 text-right min-w-0">
                                            <p className="font-bold text-primary text-sm truncate">{person1FullName}</p>
                                            <p className="text-[9px] text-gray-300 font-medium uppercase tracking-wide mt-1">الطرف الأول</p>
                                        </div>
                                        <ArrowRightLeft className="w-4 h-4 text-gray-200 shrink-0" />
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="font-bold text-primary text-sm truncate">{person2FullName}</p>
                                            <p className="text-[9px] text-gray-300 font-medium uppercase tracking-wide mt-1">الطرف الثاني</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Clear Relationship Description */}
                            <div className="px-6 py-4 bg-gray-900 rounded-xl text-white text-center shadow-lg border border-white/5 relative overflow-hidden">
                                <p className="text-sm font-medium leading-relaxed">
                                    <span className="text-primary font-bold">{person1FullName}</span> {pronoun} <span className="underline decoration-primary/40 underline-offset-4 font-bold decoration-2 text-xl mx-1 text-white">{analysisResult.relation}</span> لـ <span className="text-primary font-bold">{person2FullName}</span>
                                </p>
                            </div>

                            {analysisResult.type === 'related' && (
                                <div className="space-y-4">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 text-center">
                                            <p className="text-[9px] font-bold text-primary uppercase mb-1.5 tracking-wide">الجد المشترك</p>
                                            <p className="text-sm font-bold text-primary truncate">{(nodes.find(n => n.id === analysisResult.commonAncestor)?.data as any)?.label}</p>
                                        </div>
                                        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 text-center">
                                            <p className="text-[9px] font-bold text-primary uppercase mb-1.5 tracking-wide">عمق الطرف 1</p>
                                            <p className="text-sm font-bold text-primary">{(analysisResult.distance1 ?? 0)} أجيال</p>
                                        </div>
                                        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 text-center">
                                            <p className="text-[9px] font-bold text-primary uppercase mb-1.5 tracking-wide">عمق الطرف 2</p>
                                            <p className="text-sm font-bold text-primary">{(analysisResult.distance2 ?? 0)} أجيال</p>
                                        </div>
                                    </div>

                                    {/* Lineage Path */}
                                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide text-center border-b border-gray-50 pb-2">مسار الطرف الأول</p>
                                                <div className="space-y-2">
                                                    {analysisResult.path1?.map((id, i) => (
                                                        <div key={id} className="flex items-center gap-3 group">
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${id === person1Id ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                                                                {i === 0 ? 'G' : i}
                                                            </div>
                                                            <span className={`text-xs font-medium truncate transition-all ${id === person1Id ? 'text-primary font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                                {(nodes.find(n => n.id === id)?.data as any)?.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-3 border-r border-gray-100 pr-4">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide text-center border-b border-gray-50 pb-2">مسار الطرف الثاني</p>
                                                <div className="space-y-2">
                                                    {analysisResult.path2?.map((id, i) => (
                                                        <div key={id} className="flex items-center gap-3 group">
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${id === person2Id ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                                                                {i === 0 ? 'G' : i}
                                                            </div>
                                                            <span className={`text-xs font-medium truncate transition-all ${id === person2Id ? 'text-primary font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                                {(nodes.find(n => n.id === id)?.data as any)?.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {analysisResult.type === 'none' && (
                                <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100 shadow-sm">
                                    <p className="text-red-900 font-bold text-xl mb-2">لا توجد صلة رحم مباشرة</p>
                                    <p className="text-red-500 text-sm font-medium mb-4">لم يتم العثور على أجداد مشتركين.</p>
                                    <button
                                        onClick={() => setShowResults(false)}
                                        className="text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center gap-2 mx-auto transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        إعادة الاختيار
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RelationshipAnalysisModal;
