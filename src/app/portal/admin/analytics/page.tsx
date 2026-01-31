"use client";

import React, { useMemo } from 'react';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import { calculateFamilyStats } from '@/lib/stats/familyStats';
import { Node } from '@xyflow/react';

// Mock Data (Ideally shared or fetched)
const mockNodes: Node[] = [
    { id: '1', type: 'familyMember', data: { label: 'الجد المؤسس', gender: 'male', status: 'deceased', level: '1', birthDate: { year: '1300' } } } as any,
    { id: '2', type: 'familyMember', data: { label: 'عبدالله', gender: 'male', status: 'deceased', level: '2', birthDate: { year: '1330' } } } as any,
    { id: '3', type: 'familyMember', data: { label: 'محمد', gender: 'male', status: 'deceased', level: '2', birthDate: { year: '1335' } } } as any,
    { id: '4', type: 'familyMember', data: { label: 'فاطمة', gender: 'female', status: 'alive', level: '2', birthDate: { year: '1342' } } } as any,
    { id: '5', type: 'familyMember', data: { label: 'سارة', gender: 'female', status: 'alive', level: '3', birthDate: { year: '1360' } } } as any,
    { id: '6', type: 'familyMember', data: { label: 'خالد', gender: 'male', status: 'alive', level: '3', birthDate: { year: '1370' } } } as any,
    { id: '7', type: 'familyMember', data: { label: 'سعد', gender: 'male', status: 'alive', level: '5', birthDate: { year: '1420' } } } as any,
    { id: '8', type: 'familyMember', data: { label: 'دانه', gender: 'female', status: 'alive', level: '5', birthDate: { year: '1422' } } } as any,
    // Add more to make charts interesting...
];

export default function AnalyticsPage() {
    const stats = useMemo(() => calculateFamilyStats(mockNodes), []);

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20 p-8" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#111814]">الإحصائيات والتقارير</h1>
                    <p className="text-gray-500 mt-2">نظرة شاملة على بيانات العائلة وتوزعها</p>
                </div>

                <AnalyticsDashboard stats={stats} />
            </div>
        </div>
    );
}
