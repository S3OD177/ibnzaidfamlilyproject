"use client";

import React from 'react';
import { FamilyStats } from '@/lib/stats/familyStats';
import GenderDistributionChart from './charts/GenderDistributionChart';
import TopNamesList from './charts/TopNamesList';
import CityDistributionChart from './charts/CityDistributionChart';
import PlatformStatsCards from './PlatformStatsCards';
import { mockPlatformStats } from '@/types/platformStats';
import { Users, UserCheck, UserMinus, Activity } from 'lucide-react';

interface AnalyticsDashboardProps {
    stats: FamilyStats;
}

export default function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
    const statCards = [
        { label: 'إجمالي الأفراد', value: stats.totalMembers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'الأحياء', value: stats.livingCount, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'المتوفين', value: stats.deceasedCount, icon: UserMinus, color: 'text-gray-600', bg: 'bg-gray-50' },
        { label: 'متوسط الأبناء', value: stats.averageChildren, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#111814]">لوحة الإحصائيات</h2>

            {/* Platform Stats (New) */}
            <PlatformStatsCards stats={mockPlatformStats} />

            <h3 className="text-xl font-bold text-[#111814] mt-8 mb-4">إحصائيات شجرة العائلة</h3>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
                            <h3 className="text-2xl font-bold text-[#111814]">{card.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${card.bg}`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GenderDistributionChart data={stats.genderDistribution} />

                {/* Age Groups Placeholder */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-[#111814] mb-4">التوزيع العمري</h3>
                    <div className="space-y-4">
                        {stats.ageGroups.map((group, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{group.name} سنة</span>
                                    <span className="font-bold">{group.value}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#D4AF37]"
                                        style={{ width: `${(group.value / (stats.totalMembers || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Advanced Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TopNamesList data={stats.topMaleNames} title="أكثر الأسماء شيوعاً (ذكور)" color="bg-blue-500" />
                <TopNamesList data={stats.topFemaleNames} title="أكثر الأسماء شيوعاً (إناث)" color="bg-pink-500" />
                <CityDistributionChart data={stats.locationDistribution} />
            </div>
        </div>

    );
}
