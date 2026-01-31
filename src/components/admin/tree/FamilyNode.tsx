"use client";

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { User, Eye, Plus } from 'lucide-react';

export default memo(({ data, selected }: { data: any, selected?: boolean }) => {
    const isFemale = data.gender === 'female';
    const isDeceased = data.status === 'deceased';

    return (
        <div className={`
            relative flex flex-col items-center group
            transition-all duration-300
            ${selected ? 'z-50' : 'z-0'}
        `}>
            {/* Top Blue Bar */}
            <div className={`
                absolute top-0 left-0 right-0 h-1 rounded-t-xl z-20
                ${isFemale ? 'bg-pink-500' : 'bg-blue-500'}
            `} />

            {/* Main Node Card */}
            <div className={`
                p-2.5 rounded-xl bg-white border shadow-sm
                flex flex-col items-center gap-2 min-w-[180px]
                transition-all duration-300 cursor-pointer pt-3.5
                ${selected ? 'border-blue-400 shadow-xl ring-2 ring-blue-100 ring-offset-0' : 'border-[#e5e9e7] hover:border-blue-200'}
            `}>
                {/* Compact Header (Always Visible) */}
                <div className="w-full flex justify-between items-center gap-2">
                    {/* Left: View Button */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (data.onViewDetails) data.onViewDetails();
                        }}
                        className="flex flex-col items-center gap-0 text-gray-400 hover:text-primary transition-colors cursor-pointer min-w-[32px]"
                    >
                        <div className="size-6 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50/50 shadow-sm">
                            <Eye className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-tight">عرض</span>
                    </div>

                    {/* Center: Photo & Name */}
                    <div className="flex-1 flex items-center gap-2 justify-center">
                        <div className={`
                            size-8 rounded-full flex items-center justify-center border-2 shadow-sm overflow-hidden shrink-0
                            ${isFemale ? 'border-pink-300' : 'border-blue-300'}
                        `}>
                            {data.photo ? (
                                <img src={data.photo} alt={data.label} className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center ${isFemale ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'}`}>
                                    {isFemale ? (
                                        <span className="font-black text-[10px]">♀</span>
                                    ) : (
                                        <User className="w-3 h-3" />
                                    )}
                                </div>
                            )}
                        </div>
                        <span className="text-[13px] font-black text-[#2d332f] truncate">{data.label}</span>
                    </div>

                    {/* Right: Status */}
                    <div className="flex flex-col items-end gap-1 min-w-[40px]">
                        <div className={`
                            px-1.5 py-0.5 rounded border text-[7px] font-black
                            ${isDeceased ? 'bg-white text-gray-600 border-gray-300 shadow-sm' : 'bg-[#e7f6ed] text-[#22c55e] border-[#d1f0dc]'}
                        `}>
                            {isDeceased ? 'متوفى' : 'حي'}
                        </div>
                    </div>
                </div>

                {/* Expanded Sections (Visible only when selected) */}
                {selected && (
                    <div className="w-full flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 pt-1">
                        {/* Color Indicators */}
                        <div className="flex justify-center gap-1.5 w-full">
                            <div className="size-5 rounded-md bg-[#94a3b8] shadow-sm border border-white" />
                            <div className="size-5 rounded-md bg-[#8b5cf6] shadow-sm border border-white" />
                            <div className="size-5 rounded-md bg-[#3b82f6] shadow-sm border border-white" />
                            <div className="size-5 rounded-md bg-[#22c55e] shadow-sm border border-white" />
                            <div className="size-5 rounded-md bg-[#f59e0b] shadow-sm border border-white" />
                            <div className="size-5 rounded-md bg-[#ef4444] shadow-sm border border-white" />
                        </div>

                        {/* Action: Add Member */}
                        <div className="w-full border-t border-gray-50 pt-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (data.onAddMember) data.onAddMember();
                                }}
                                className="w-full py-2 bg-[#00c853] text-white rounded-lg flex items-center justify-center gap-2 text-xs font-black hover:bg-[#00b24a] transition-all shadow-md active:scale-95"
                            >
                                <span className="text-sm">إضافة فرد</span>
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Connection Points */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-primary border-2 border-white !shadow-sm"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-primary border-2 border-white !shadow-sm"
            />
        </div>
    );
});
