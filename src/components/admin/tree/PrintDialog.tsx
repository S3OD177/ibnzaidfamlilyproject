"use client";

import { useState } from 'react';
import { Printer, X, Check, FileCheck, Eye, EyeOff } from 'lucide-react';

interface PrintDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onPrint: (options: PrintOptions) => void;
}

export interface PrintOptions {
    showPhotos: boolean;
    showDetails: boolean;
    showDeceasedStatus: boolean;
    orientation: 'portrait' | 'landscape';
    scale: number;
}

export default function PrintDialog({ isOpen, onClose, onPrint }: PrintDialogProps) {
    const [options, setOptions] = useState<PrintOptions>({
        showPhotos: true,
        showDetails: true,
        showDeceasedStatus: true,
        orientation: 'landscape',
        scale: 100
    });

    if (!isOpen) return null;

    const handlePrint = () => {
        onPrint(options);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Printer className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">طباعة الشجرة</h2>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">تخصيص خيارات الطباعة</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Visual Options */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">خيارات العرض</label>

                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 cursor-pointer hover:border-primary/30 hover:bg-gray-50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${options.showPhotos ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Eye className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-gray-700">الصور الشخصية</span>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${options.showPhotos ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                                    {options.showPhotos && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={options.showPhotos}
                                    onChange={(e) => setOptions({ ...options, showPhotos: e.target.checked })}
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 cursor-pointer hover:border-primary/30 hover:bg-gray-50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${options.showDetails ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <FileCheck className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-gray-700">بيانات تفصيلية</span>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${options.showDetails ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                                    {options.showDetails && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={options.showDetails}
                                    onChange={(e) => setOptions({ ...options, showDetails: e.target.checked })}
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 cursor-pointer hover:border-primary/30 hover:bg-gray-50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${options.showDeceasedStatus ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <EyeOff className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-gray-700">علامة المتوفين</span>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${options.showDeceasedStatus ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                                    {options.showDeceasedStatus && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={options.showDeceasedStatus}
                                    onChange={(e) => setOptions({ ...options, showDeceasedStatus: e.target.checked })}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Scale */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">حجم الطباعة</label>
                            <span className="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-lg">{options.scale}%</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="150"
                            step="10"
                            value={options.scale}
                            onChange={(e) => setOptions({ ...options, scale: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1">
                            <span>صغير (50%)</span>
                            <span>طبيعي (100%)</span>
                            <span>كبير (150%)</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Printer className="w-5 h-5" />
                        طباعة
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
}
