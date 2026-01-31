"use client";

import React, { useState } from 'react';
import { X, Calendar, Type, FileText, Users, PartyPopper, AlertCircle, Bookmark } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';

const EVENT_CATEGORIES = [
    {
        id: 'meeting',
        label: 'اجتماع',
        icon: <Users className="w-5 h-5" />,
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        activeColor: '#9333ea',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600'
    },
    {
        id: 'occasion',
        label: 'مناسبة',
        icon: <PartyPopper className="w-5 h-5" />,
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        activeColor: '#d97706',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600'
    },
    {
        id: 'urgent',
        label: 'هام جداً',
        icon: <AlertCircle className="w-5 h-5" />,
        color: 'bg-red-100 text-red-700 border-red-200',
        activeColor: '#dc2626',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600'
    },
    {
        id: 'general',
        label: 'عام',
        icon: <Bookmark className="w-5 h-5" />,
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        activeColor: '#2563eb',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
    }
];

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (event: Partial<CalendarEvent>) => void;
    selectedDate: Date;
}

export default function AddEventModal({ isOpen, onClose, onAdd, selectedDate }: AddEventModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(EVENT_CATEGORIES[0]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            title,
            description,
            type: 'custom', // Keep generic type for now, distinction is visual via color
            date: selectedDate,
            color: selectedCategory.color
        });
        // Reset and close
        setTitle('');
        setDescription('');
        setSelectedCategory(EVENT_CATEGORIES[0]);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 cursor-default border border-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-[#f8faf9] p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-[#111814]">إضافة حدث جديد</h3>
                        <p className="text-xs text-gray-500 mt-1">أضف مناسبة أو تذكير للتقويم العائلي</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-full text-gray-400 hover:text-red-500 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Date Display */}
                    <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="bg-white p-3 rounded-xl shadow-sm text-center min-w-[60px]">
                            <span className="block text-xs font-bold text-gray-400 uppercase">
                                {selectedDate.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="block text-2xl font-bold text-primary leading-none mt-1">
                                {selectedDate.getDate()}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 mb-1">التاريخ المحدد</p>
                            <p className="font-bold text-[#111814]">
                                {selectedDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">عنوان الحدث</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="مثال: اجتماع العائلة السنوي"
                                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            />
                            <Type className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">نوع الحدث</label>
                        <div className="grid grid-cols-2 gap-3">
                            {EVENT_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-right
                                        ${selectedCategory.id === cat.id
                                            ? `bg-white border-2 border-[${cat.activeColor}] shadow-md ring-1 ring-[${cat.activeColor}]`
                                            : 'bg-gray-50 border-transparent hover:bg-gray-100'
                                        }
                                    `}
                                    style={{
                                        borderColor: selectedCategory.id === cat.id ? 'var(--tw-ring-color)' : 'transparent',
                                        // Using style for dynamic active border color if tailwind safelist issues arise, 
                                        // but sticking to class manipulation for simplicity first.
                                        // A simple ring/border approach is safer:
                                    }}
                                >
                                    <div className={`p-2 rounded-lg ${cat.iconBg} ${cat.iconColor}`}>
                                        {cat.icon}
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-gray-800">{cat.label}</span>
                                    </div>
                                    {selectedCategory.id === cat.id && (
                                        <div className="mr-auto w-2 h-2 rounded-full bg-primary/80" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">التفاصيل (اختياري)</label>
                        <div className="relative">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="أضف أي تفاصيل أو ملاحظات إضافية..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
                        >
                            <Calendar className="w-5 h-5" />
                            حفظ الحدث
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
