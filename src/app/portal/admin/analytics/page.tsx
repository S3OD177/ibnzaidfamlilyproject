import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import { getFamilyStats, getPlatformStats } from '@/lib/data/stats';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    const [stats, platform] = await Promise.all([getFamilyStats(), getPlatformStats()]);

    return (
        <div className="min-h-screen bg-canvas pb-20 p-8" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-ink">الإحصائيات والتقارير</h1>
                    <p className="text-gray-500 mt-2">نظرة شاملة على بيانات العائلة وتوزعها</p>
                </div>

                <AnalyticsDashboard stats={stats} platform={platform} />
            </div>
        </div>
    );
}
