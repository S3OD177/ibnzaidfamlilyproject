import { TimelineEvent } from '@/types/timeline';
import { Calendar, Baby, UserMinus, Star, Heart } from 'lucide-react';
import Link from 'next/link';

interface TimelineProps {
    events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
    if (!events || events.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                لا توجد أحداث تاريخية مسجلة بعد.
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'birth': return <Baby className="w-5 h-5 text-blue-500" />;
            case 'death': return <UserMinus className="w-5 h-5 text-red-500" />;
            case 'marriage': return <Heart className="w-5 h-5 text-pink-500" />;
            default: return <Star className="w-5 h-5 text-[#D4AF37]" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'birth': return 'bg-blue-50 border-blue-100';
            case 'death': return 'bg-red-50 border-red-100';
            case 'marriage': return 'bg-pink-50 border-pink-100';
            default: return 'bg-yellow-50 border-yellow-100';
        }
    };

    return (
        <div className="relative border-r border-[#dbe6e0] mr-6 space-y-12">
            {events.map((event, index) => (
                <div key={event.id} className="relative pr-8">
                    {/* Timeline Dot */}
                    <div className="absolute top-0 -right-3 w-6 h-6 rounded-full bg-white border-4 border-[#D4AF37] shadow-sm z-10" />

                    {/* Content Card */}
                    <div className={`p-5 rounded-2xl border transition-all hover:shadow-md ${getBgColor(event.type)}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-[#111814] flex items-center gap-2">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                    {getIcon(event.type)}
                                </div>
                                {event.title}
                            </h3>
                            <span className="flex items-center gap-1 text-sm font-bold text-gray-500 bg-white/50 px-2 py-1 rounded-lg">
                                <Calendar className="w-3.5 h-3.5" />
                                {event.year} هـ
                            </span>
                        </div>

                        {event.description && (
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                {event.description}
                            </p>
                        )}

                        {event.memberId && (
                            <Link
                                href={`/portal/members/${event.memberId}`}
                                className="inline-flex items-center text-xs font-bold text-[#D4AF37] hover:underline"
                            >
                                عرض الملف الشخصي
                            </Link>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
