"use client";


import { X, User, Trash2, Save, Calendar, MapPin, Heart, Plus, ChevronDown, Phone, Mail, Globe, Hash, Eye, MoreVertical, History } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import ImageUpload from '../common/ImageUpload';
import Timeline from '@/components/timeline/Timeline';
import { generateTimelineEvents } from '@/lib/timeline/timelineUtils';

import { Member, defaultMember } from '@/types/member';

interface MemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    onSave: (data: any, newMembers?: any[]) => void;
    onDelete: () => void;
    onViewInTree?: () => void;
    initialTab?: 'info' | 'add' | 'edit';
}

export default function MemberModal({ isOpen, onClose, data, onSave, onDelete, onViewInTree, initialTab = 'info' }: MemberModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'add' | 'edit' | 'timeline'>(initialTab as any);
    const [newMembers, setNewMembers] = useState<any[]>([{ label: '', gender: 'male', status: 'unknown' }]); // Initial new member form

    const addNewMemberForm = () => {
        setNewMembers([...newMembers, { label: '', gender: 'male', status: 'unknown' }]);
    };

    const removeNewMemberForm = (index: number) => {
        setNewMembers(newMembers.filter((_, i) => i !== index));
    };

    const updateNewMember = (index: number, field: string, value: any) => {
        const updated = [...newMembers];
        updated[index] = { ...updated[index], [field]: value };
        setNewMembers(updated);
    };

    const [formData, setFormData] = useState<Member>({
        ...defaultMember,
        // Ensure required fields for UI are present even if partial
        birthDate: defaultMember.birthDate!,
        deathDate: defaultMember.deathDate!,
        socialMedia: defaultMember.socialMedia!
    } as Member);

    const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
    const optionsRef = useRef<HTMLDivElement>(null);

    // Close options menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setIsOptionsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync activeTab with initialTab when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    useEffect(() => {
        if (data) {
            setFormData(prev => ({ ...prev, ...data }));
            // Keep current tab or default to info if opening new
            if (!isOpen) setActiveTab('info');
        }
    }, [data, isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-display"
            onClick={onClose}
        >
            <div
                className="bg-[#fcfdfc] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Tabs Header - Segmented Control Style */}
                <div className="bg-[#fcfdfc] px-6 pt-6 pb-2 border-b border-gray-50">
                    <div className="flex bg-gray-100/50 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1.5 ${activeTab === 'info'
                                ? 'bg-white text-[#111814] shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <User className="w-3.5 h-3.5" />
                            المعلومات
                        </button>
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1.5 ${activeTab === 'add'
                                ? 'bg-white text-green-700 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            إضافة
                        </button>
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1.5 ${activeTab === 'edit'
                                ? 'bg-white text-[#D4AF37] shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Save className="w-3.5 h-3.5" />
                            تعديل
                        </button>
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-1.5 ${activeTab === 'timeline'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <History className="w-3.5 h-3.5" />
                            السجل
                        </button>
                    </div>
                </div>

                {/* Header Summary */}
                <div className="bg-[#fcfdfc]/50 p-4 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-[#111814]">{formData.label || "الاسم"}</h2>
                            {formData.gender === 'male' ? <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> : <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />}
                            <User className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold mt-1">
                            <span>الرقم التسلسلي: {formData.serialNumber || '---'}</span>
                            <span className="text-gray-300">|</span>
                            <span>المستوى {formData.level}</span>
                        </div>
                        {formData.status === 'deceased' && (
                            <span className="mt-2 inline-block px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold border border-red-100">متوفى</span>
                        )}
                    </div>

                    {/* Options Button & Dropdown */}
                    <div className="relative" ref={optionsRef}>
                        <button
                            onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
                            className="bg-white border border-gray-200 rounded px-3 py-1 text-xs font-bold text-gray-600 shadow-sm flex items-center gap-1 hover:bg-gray-50 transition-colors"
                        >
                            خيارات
                            <MoreVertical className="w-3 h-3 text-gray-400" />
                        </button>

                        {isOptionsMenuOpen && (
                            <div className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                                <button
                                    onClick={() => {
                                        setIsOptionsMenuOpen(false);
                                        if (onViewInTree) onViewInTree();
                                        else onClose();
                                    }}
                                    className="w-full px-3 py-2 text-right text-[11px] font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                                >
                                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                                    <span>عرض في الشجرة</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setIsOptionsMenuOpen(false);
                                        // Logic for adding father could go here
                                    }}
                                    className="w-full px-3 py-2 text-right text-[11px] font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                                >
                                    <Plus className="w-3.5 h-3.5 text-gray-400" />
                                    <span>إضافة أب</span>
                                </button>
                                <div className="h-px bg-gray-50 my-1" />
                                <button
                                    onClick={() => {
                                        if (confirm('هل أنت متأكد من حذف هذا الفرد؟')) {
                                            onDelete();
                                            onClose();
                                        }
                                        setIsOptionsMenuOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-right text-[11px] font-bold text-red-500 hover:bg-red-50 flex items-center justify-between"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    <span>حذف</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#fcfdfc] space-y-4">

                    {/* --- INFO TAB --- */}
                    {activeTab === 'info' && (
                        <div className="space-y-4">
                            {/* Personal Data Card */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                                <div className="space-y-3 flex-1">
                                    <h3 className="text-xs font-bold text-[#111814] mb-3">البيانات الشخصية</h3>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-medium">الجوال</span>
                                            <span className="text-xs font-bold text-gray-300">{formData.mobile || "لا يوجد"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-medium">البريد الإلكتروني</span>
                                            <span className="text-xs font-bold text-gray-300">{formData.email || "لا يوجد"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-medium">الموقع</span>
                                            <span className="text-xs font-bold text-gray-300">{formData.website || "لا يوجد"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-medium">اللقب</span>
                                            <span className="text-xs font-bold text-gray-300">{formData.nickname || "لا يوجد"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Avatar */}
                                <div className="mr-6">
                                    <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                                        {formData.photo ? (
                                            <img src={formData.photo} alt={formData.label} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <User className="w-10 h-10 stroke-[1.5]" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bio Card */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
                                <h3 className="text-xs font-bold text-[#111814]">النبذة</h3>
                                <p className="text-xs text-gray-300 font-bold">{formData.bio || "لا يوجد"}</p>
                            </div>

                            {/* Relatives Card */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-[#111814]">الأقارب</h3>
                                    <div className="flex gap-4 text-[10px] font-bold text-gray-500">
                                        <span>الأبناء والبنات <span className="text-[#111814]">{data?.relatives?.children?.length || 0}</span></span>
                                        <span>الإخوان والأخوات <span className="text-[#111814]">{data?.relatives?.siblings?.length || 0}</span></span>
                                    </div>
                                </div>

                                {/* Brothers & Sisters */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-gray-500">الإخوان</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {data?.relatives?.siblings?.filter((r: any) => r.gender === 'male').length > 0 ? (
                                                data.relatives.siblings.filter((r: any) => r.gender === 'male').map((rel: any) => (
                                                    <span key={rel.id} className="px-3 py-1 bg-[#00c853] text-white text-[10px] font-bold rounded">{rel.label}</span>
                                                ))
                                            ) : <span className="text-[10px] text-gray-300">لا يوجد</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-gray-500">الأخوات</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {data?.relatives?.siblings?.filter((r: any) => r.gender === 'female').length > 0 ? (
                                                data.relatives.siblings.filter((r: any) => r.gender === 'female').map((rel: any) => (
                                                    <span key={rel.id} className="px-3 py-1 bg-[#00c853] text-white text-[10px] font-bold rounded">{rel.label}</span>
                                                ))
                                            ) : <span className="text-[10px] text-gray-300">لا يوجد</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Sons & Daughters */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-gray-500">الأبناء</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {data?.relatives?.children?.filter((r: any) => r.gender === 'male').length > 0 ? (
                                                data.relatives.children.filter((r: any) => r.gender === 'male').map((rel: any) => (
                                                    <span key={rel.id} className="px-3 py-1 bg-[#00c853] text-white text-[10px] font-bold rounded">{rel.label}</span>
                                                ))
                                            ) : <span className="text-[10px] text-gray-300">لا يوجد</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-gray-500">البنات</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {data?.relatives?.children?.filter((r: any) => r.gender === 'female').length > 0 ? (
                                                data.relatives.children.filter((r: any) => r.gender === 'female').map((rel: any) => (
                                                    <span key={rel.id} className="px-3 py-1 bg-[#00c853] text-white text-[10px] font-bold rounded">{rel.label}</span>
                                                ))
                                            ) : <span className="text-[10px] text-gray-300">لا يوجد</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Spouses Card */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2 min-h-[100px]">
                                <h3 className="text-xs font-bold text-[#111814]">الأزواج</h3>
                                <div className="flex items-center justify-center h-full pt-4">
                                    <span className="text-xs text-gray-300 font-bold">لا يوجد أزواج</span>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* --- ADD TAB --- */}
                    {activeTab === 'add' && (
                        <div className="space-y-4">
                            {newMembers.map((member, index) => (
                                <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4 relative group">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-[#111814]">اسم الفرد #{index + 1}</h3>
                                        {newMembers.length > 1 && (
                                            <button
                                                onClick={() => removeNewMemberForm(index)}
                                                className="text-red-500 hover:bg-red-50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            value={member.label}
                                            onChange={(e) => updateNewMember(index, 'label', e.target.value)}
                                            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                            placeholder="الاسم..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Gender */}
                                        <div className="flex items-center gap-4">
                                            <label className="text-xs font-bold text-gray-700 w-16">الجنس</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`new-gender-${index}`}
                                                        checked={member.gender === 'male'}
                                                        onChange={() => updateNewMember(index, 'gender', 'male')}
                                                        className="accent-primary"
                                                    />
                                                    <span className="text-xs text-gray-600">ذكر</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`new-gender-${index}`}
                                                        checked={member.gender === 'female'}
                                                        onChange={() => updateNewMember(index, 'gender', 'female')}
                                                        className="accent-pink-500"
                                                    />
                                                    <span className="text-xs text-gray-600">أنثى</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center gap-4">
                                            <label className="text-xs font-bold text-gray-700 w-16">حالة الحياة</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`new-status-${index}`}
                                                        checked={member.status === 'alive'}
                                                        onChange={() => updateNewMember(index, 'status', 'alive')}
                                                        className="accent-green-500"
                                                    />
                                                    <span className="text-xs text-gray-600">حي</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`new-status-${index}`}
                                                        checked={member.status === 'deceased'}
                                                        onChange={() => updateNewMember(index, 'status', 'deceased')}
                                                        className="accent-red-500"
                                                    />
                                                    <span className="text-xs text-gray-600">متوفى</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`new-status-${index}`}
                                                        checked={member.status === 'unknown'}
                                                        onChange={() => updateNewMember(index, 'status', 'unknown')}
                                                        className="accent-gray-500"
                                                    />
                                                    <span className="text-xs text-gray-600">غير معروف</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeNewMemberForm(index)}
                                        className="text-xs text-white bg-[#ef5350]/90 hover:bg-[#ef5350] px-3 py-1.5 rounded font-bold transition-all w-fit"
                                    >
                                        حذف الفرد
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={addNewMemberForm}
                                className="w-full py-3 bg-white border border-[#dbe6e0] rounded-xl shadow-sm hover:border-primary hover:shadow-md transition-all flex items-center justify-center gap-2 text-gray-600 font-bold text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                إضافة فرد آخر
                            </button>
                        </div>
                    )}


                    {/* --- EDIT TAB --- */}
                    {activeTab === 'edit' && (
                        <>
                            {/* Basic Data */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                <h3 className="text-xs font-bold text-gray-700 mb-2">بيانات أساسية</h3>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">الاسم</label>
                                    <input
                                        type="text"
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">رقم الجوال</label>
                                    <input
                                        type="text"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">البريد الإلكتروني</label>
                                    <input
                                        type="text"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">الصورة الشخصية</label>
                                    <ImageUpload
                                        value={formData.photo}
                                        onChange={(base64) => setFormData({ ...formData, photo: base64 })}
                                        showPreview={true}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 pt-2">
                                    {/* Gender */}
                                    <div className="flex items-center gap-4">
                                        <label className="text-xs font-bold text-gray-700 w-16">الجنس</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="gender" checked={formData.gender === 'male'} onChange={() => setFormData({ ...formData, gender: 'male' })} className="accent-primary" />
                                                <span className="text-xs text-gray-600">ذكر</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="gender" checked={formData.gender === 'female'} onChange={() => setFormData({ ...formData, gender: 'female' })} className="accent-pink-500" />
                                                <span className="text-xs text-gray-600">أنثى</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center gap-4">
                                        <label className="text-xs font-bold text-gray-700 w-16">الحالة</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="status" checked={formData.status === 'alive'} onChange={() => setFormData({ ...formData, status: 'alive' })} className="accent-green-500" />
                                                <span className="text-xs text-gray-600">حي</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="status" checked={formData.status === 'deceased'} onChange={() => setFormData({ ...formData, status: 'deceased' })} className="accent-red-500" />
                                                <span className="text-xs text-gray-600">متوفى</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="status" checked={formData.status === 'unknown'} onChange={() => setFormData({ ...formData, status: 'unknown' })} className="accent-gray-500" />
                                                <span className="text-xs text-gray-600">غير معروف</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Spouses */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                                <h3 className="text-xs font-bold text-gray-700 mb-1">الأزواج</h3>
                                <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                                    إضافة زوج / زوجة
                                </button>
                            </div>

                            {/* Additional Data */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                <h3 className="text-xs font-bold text-gray-700 mb-2">بيانات إضافية</h3>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">اللقب</label>
                                    <input
                                        type="text"
                                        value={formData.nickname}
                                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">الفرع</label>
                                    <input
                                        type="text"
                                        value={formData.branch}
                                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">علامة تدل على منزلة الفرد في الشجرة</label>
                                    <input
                                        type="text"
                                        value={formData.generationMark}
                                        onChange={(e) => setFormData({ ...formData, generationMark: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                        placeholder="مثال: الجيل الخامس"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">الترتيب</label>
                                    <input
                                        type="number"
                                        value={formData.siblingOrder}
                                        onChange={(e) => setFormData({ ...formData, siblingOrder: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                        placeholder="ترتيب الفرد بين إخوانه..."
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">النبذة</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none min-h-[80px]"
                                    />
                                </div>
                            </div>

                            {/* Education & Work (New Phase 2) */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                <h3 className="text-xs font-bold text-gray-700 mb-2">التعليم والعمل</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">الوظيفة</label>
                                        <input
                                            type="text"
                                            value={formData.occupation || ''}
                                            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                            placeholder="مثال: مهندس"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">جهة العمل</label>
                                        <input
                                            type="text"
                                            value={formData.company || ''}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">المؤهل العلمي</label>
                                        <input
                                            type="text"
                                            value={formData.education || ''}
                                            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                            placeholder="مثال: بكالوريوس حاسب"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">الجامعة / المؤسسة</label>
                                        <input
                                            type="text"
                                            value={formData.university || ''}
                                            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Social Media (New Phase 2) */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                <h3 className="text-xs font-bold text-gray-700 mb-2">التواصل الاجتماعي</h3>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.socialMedia?.twitter || ''}
                                            onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, twitter: e.target.value } })}
                                            className="w-full p-2 pr-10 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none text-left ltr"
                                            placeholder="Twitter Handle"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.socialMedia?.linkedin || ''}
                                            onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, linkedin: e.target.value } })}
                                            className="w-full p-2 pr-10 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none text-left ltr"
                                            placeholder="LinkedIn Profile"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">الموقع</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">الدولة</label>
                                    <div className="relative">
                                        <select
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none appearance-none bg-white"
                                        >
                                            <option value="">اختر</option>
                                            <option value="SA">المملكة العربية السعودية</option>
                                            <option value="KW">الكويت</option>
                                            <option value="AE">الإمارات</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                <h3 className="text-xs font-bold text-gray-700 mb-2">تاريخ الميلاد والوفاة</h3>

                                {/* Birth */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-gray-500">تاريخ الميلاد</label>
                                        <span className="text-[10px] text-gray-400">التاريخ الهجري</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="text" className="w-14 p-2 text-center text-sm rounded border border-gray-200" placeholder="1" defaultValue={formData.birthDate?.day || '1'} onChange={(e) => setFormData({ ...formData, birthDate: { ...formData.birthDate!, day: e.target.value } })} />
                                        <input type="text" className="w-14 p-2 text-center text-sm rounded border border-gray-200" placeholder="1" defaultValue={formData.birthDate?.month || '1'} onChange={(e) => setFormData({ ...formData, birthDate: { ...formData.birthDate!, month: e.target.value } })} />
                                        <input type="text" className="flex-1 p-2 text-center text-sm rounded border border-gray-200" placeholder="1400" defaultValue={formData.birthDate?.year || '1400'} onChange={(e) => setFormData({ ...formData, birthDate: { ...formData.birthDate!, year: e.target.value } })} />
                                    </div>
                                </div>

                                {/* Death */}
                                {formData.status === 'deceased' && (
                                    <div className="space-y-2 pt-2 border-t border-gray-50">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-red-500">تاريخ الوفاة</label>
                                            <span className="text-[10px] text-gray-400">التاريخ الهجري</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="text" className="w-14 p-2 text-center text-sm rounded border border-red-100" placeholder="1" defaultValue={formData.deathDate?.day || '1'} onChange={(e) => setFormData({ ...formData, deathDate: { ...formData.deathDate!, day: e.target.value } })} />
                                            <input type="text" className="w-14 p-2 text-center text-sm rounded border border-red-100" placeholder="1" defaultValue={formData.deathDate?.month || '1'} onChange={(e) => setFormData({ ...formData, deathDate: { ...formData.deathDate!, month: e.target.value } })} />
                                            <input type="text" className="flex-1 p-2 text-center text-sm rounded border border-red-100" placeholder="1400" defaultValue={formData.deathDate?.year || '1400'} onChange={(e) => setFormData({ ...formData, deathDate: { ...formData.deathDate!, year: e.target.value } })} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Timeline Tab */}
                    {activeTab === 'timeline' && (
                        <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
                            <Timeline events={generateTimelineEvents([formData])} />
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-white border-t border-gray-100">
                    {activeTab === 'edit' && (
                        <button
                            onClick={() => onSave(formData)}
                            className="w-full py-3 bg-[#00c853] text-white font-bold rounded-lg shadow-sm hover:bg-[#00b248] transition-colors"
                        >
                            تعديل
                        </button>
                    )}
                    {activeTab === 'add' && (
                        <button
                            onClick={() => {
                                onSave(formData, newMembers);
                                onClose();
                                setNewMembers([{ label: '', gender: 'male', status: 'unknown' }]); // Reset
                            }}
                            className="w-full py-3 bg-[#00c853] text-white font-bold rounded-lg shadow-sm hover:bg-[#00b248] transition-colors"
                        >
                            إضافة الأفراد
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
