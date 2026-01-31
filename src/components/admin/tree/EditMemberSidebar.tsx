"use client";

import { X, User, Trash2, Save, Calendar, MapPin, Heart, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import ImageUpload from '../common/ImageUpload';

interface MemberData {
    label: string;
    isDeceased: boolean;
    serialNumber: string;
    level: string;
    gender: 'male' | 'female';
    photo?: string;
    spouses: string[];
    generationMark: string;
    siblingOrder: string;
    location: string;
    birthDate: { day: string; month: string; year: string; type: 'Hijri' | 'Gregorian' };
    deathDate?: { day: string; month: string; year: string; type: 'Hijri' | 'Gregorian' };
}

interface EditMemberSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    onSave: (data: any) => void;
    onDelete: () => void;
}

export default function EditMemberSidebar({ isOpen, onClose, data, onSave, onDelete }: EditMemberSidebarProps) {
    const [formData, setFormData] = useState<MemberData>({
        label: '',
        isDeceased: false,
        serialNumber: '',
        level: '',
        gender: 'male',
        spouses: [],
        generationMark: '',
        siblingOrder: '',
        location: '',
        birthDate: { day: '1', month: '1', year: '1400', type: 'Hijri' },
    });

    const [activeTab, setActiveTab] = useState<'basic' | 'additional'>('basic');

    useEffect(() => {
        if (data) {
            setFormData({
                ...formData,
                ...data
            });
        }
    }, [data]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 left-0 w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r border-[#dbe6e0] flex flex-col font-display overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#dbe6e0] flex items-center justify-between bg-[#f6f8f6]">
                <div>
                    <h3 className="font-bold text-[#111814] text-lg">{formData.label || 'عضو جديد'}</h3>
                    <p className="text-xs text-gray-500">الرقم التسلسلي: {formData.serialNumber || '---'}</p>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#dbe6e0]">
                <button
                    onClick={() => setActiveTab('basic')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'basic' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    بيانات أساسية
                </button>
                <button
                    onClick={() => setActiveTab('additional')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'additional' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    بيانات إضافية
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {activeTab === 'basic' && (
                    <>
                        {/* Image Upload */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#61896f]">الصورة الشخصية</label>
                            <ImageUpload
                                value={formData.photo}
                                onChange={(base64) => setFormData({ ...formData, photo: base64 })}
                                showPreview={true}
                            />
                        </div>

                        {/* Basic Fields */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#61896f]">الاسم رباعي</label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full p-2.5 rounded-lg border border-[#dbe6e0] text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#61896f]">المستوى / الجيل</label>
                                    <input
                                        type="number"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-[#dbe6e0] text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#61896f]">الرقم التسلسلي</label>
                                    <input
                                        type="text"
                                        value={formData.serialNumber}
                                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-[#dbe6e0] text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                <label className="flex items-center gap-2 cursor-pointer w-full">
                                    <input
                                        type="checkbox"
                                        checked={formData.isDeceased}
                                        onChange={(e) => setFormData({ ...formData, isDeceased: e.target.checked })}
                                        className="w-4 h-4 accent-red-500"
                                    />
                                    <span className="text-sm font-bold text-red-700">متوفى</span>
                                </label>
                            </div>
                        </div>

                        {/* Spouses */}
                        <div className="space-y-3 pt-2 border-t border-[#dbe6e0]">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-[#111814] flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-pink-500" />
                                    الأزواج
                                </h4>
                                <button className="text-xs font-bold text-primary hover:bg-primary/5 px-2 py-1 rounded transition-colors">+ إضافة زوج/ة</button>
                            </div>
                            <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-xs text-gray-400">
                                لا يوجد أزواج مضافين
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'additional' && (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#61896f]">علامة الجيل (المنزلة)</label>
                            <input
                                type="text"
                                value={formData.generationMark}
                                onChange={(e) => setFormData({ ...formData, generationMark: e.target.value })}
                                placeholder="مثال: الجيل الخامس"
                                className="w-full p-2.5 rounded-lg border border-[#dbe6e0] text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#61896f]">ترتيب الفرد بين إخوانه</label>
                            <input
                                type="number"
                                value={formData.siblingOrder}
                                onChange={(e) => setFormData({ ...formData, siblingOrder: e.target.value })}
                                className="w-full p-2.5 rounded-lg border border-[#dbe6e0] text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#61896f]">الموقع الجغرافي</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="الرياض، المملكة العربية السعودية"
                                    className="w-full p-2.5 pl-10 rounded-lg border border-[#dbe6e0] text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#dbe6e0] space-y-4">
                            <h4 className="text-sm font-bold text-[#111814] flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                تواريخ الميلاد والوفاة
                            </h4>

                            {/* Birth Date */}
                            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-gray-600">تاريخ الميلاد</span>
                                    <select className="text-xs bg-transparent font-bold text-primary outline-none">
                                        <option>هجري</option>
                                        <option>ميلادي</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="اليوم" className="flex-1 w-full p-2 text-center text-sm rounded border border-gray-200" defaultValue="1" />
                                    <input type="text" placeholder="الشهر" className="flex-1 w-full p-2 text-center text-sm rounded border border-gray-200" defaultValue="1" />
                                    <input type="text" placeholder="السنة" className="flex-2 w-full p-2 text-center text-sm rounded border border-gray-200" defaultValue="1400" />
                                </div>
                            </div>

                            {/* Death Date - Only if deceased */}
                            {formData.isDeceased && (
                                <div className="p-3 bg-red-50 rounded-lg space-y-2 border border-red-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-red-700">تاريخ الوفاة</span>
                                        <select className="text-xs bg-transparent font-bold text-red-600 outline-none">
                                            <option>هجري</option>
                                            <option>ميلادي</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="اليوم" className="flex-1 w-full p-2 text-center text-sm rounded border border-red-200 bg-white" />
                                        <input type="text" placeholder="الشهر" className="flex-1 w-full p-2 text-center text-sm rounded border border-red-200 bg-white" />
                                        <input type="text" placeholder="السنة" className="flex-2 w-full p-2 text-center text-sm rounded border border-red-200 bg-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[#dbe6e0] bg-[#f6f8f6] space-y-3">
                <button
                    onClick={() => onSave(formData)}
                    className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                </button>
                <button
                    onClick={onDelete}
                    className="w-full py-2.5 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    حذف بطاقة الفرد
                </button>
            </div>
        </div>
    );
}
