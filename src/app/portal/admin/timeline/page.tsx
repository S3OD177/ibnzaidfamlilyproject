"use client";

import React, { useMemo } from 'react';
import Timeline from '@/components/timeline/Timeline';
import { generateTimelineEvents } from '@/lib/timeline/timelineUtils';
import { Member } from '@/types/member';

// Mock Data
const mockMembers: Member[] = [
    { id: '1', label: 'الجد المؤسس', gender: 'male', status: 'deceased', birthDate: { day: '1', month: '1', year: '1300', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1380', type: 'Hijri' } },
    { id: '2', label: 'عبدالله', gender: 'male', status: 'deceased', birthDate: { day: '1', month: '1', year: '1330', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1410', type: 'Hijri' } },
    { id: '3', label: 'محمد', gender: 'male', status: 'deceased', birthDate: { day: '1', month: '1', year: '1335', type: 'Hijri' }, deathDate: { day: '1', month: '1', year: '1420', type: 'Hijri' } },
    { id: '4', label: 'سارة', gender: 'female', status: 'alive', birthDate: { day: '1', month: '1', year: '1360', type: 'Hijri' } },
    { id: '5', label: 'خالد', gender: 'male', status: 'alive', birthDate: { day: '1', month: '1', year: '1370', type: 'Hijri' } },
    { id: '6', label: 'صالح', gender: 'male', status: 'alive', birthDate: { day: '1', month: '1', year: '1400', type: 'Hijri' } },
    { id: '7', label: 'نورة', gender: 'female', status: 'alive', birthDate: { day: '1', month: '1', year: '1410', type: 'Hijri' } },
] as Member[];

export default function TimelinePage() {
    const events = useMemo(() => generateTimelineEvents(mockMembers), []);

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20 p-8" dir="rtl">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#111814]">السجل التاريخي</h1>
                    <p className="text-gray-500 mt-2">توثيق زمني لأهم أحداث العائلة</p>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-[#dbe6e0] shadow-sm">
                    <Timeline events={events} />
                </div>
            </div>
        </div>
    );
}
