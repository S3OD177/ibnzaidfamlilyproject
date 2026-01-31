import { PlatformStats } from "@/types/platformStats";
import { Users, FileText, Server, CheckCircle, Clock } from "lucide-react";

export default function PlatformStatsCards({ stats }: { stats: PlatformStats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Users Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">مستخدمي المنصة</p>
                        <h3 className="text-3xl font-bold text-[#111814] mt-1">{stats.users.total}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {stats.users.active} نشط
                    </span>
                    <span className="text-orange-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {stats.users.pending} انتظار
                    </span>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">المحتوى والأرشيف</p>
                        <h3 className="text-3xl font-bold text-[#111814] mt-1">{stats.content.documents}</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    <span className="font-bold text-indigo-600">{stats.content.newsUrl}</span> خبر و <span className="font-bold text-indigo-600">{stats.content.events}</span> فعالية
                </div>
            </div>


            {/* System Status Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">حالة النظام</p>
                        <h3 className="text-lg font-bold text-green-600 mt-2 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                            {stats.system.status === 'Operational' ? 'يعمل بكفاءة' : stats.system.status}
                        </h3>
                    </div>
                    <div className="p-3 bg-gray-50 text-gray-600 rounded-xl group-hover:scale-110 transition-transform">
                        <Server className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-[10px] text-gray-400">
                    آخر نسخة احتياطية: {stats.system.lastBackup}
                    <br />
                    الإصدار: {stats.system.version}
                </div>
            </div>
        </div>
    );
}
