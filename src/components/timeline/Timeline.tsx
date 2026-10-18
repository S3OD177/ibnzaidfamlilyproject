import { TimelineEvent } from '@/types/timeline';
import { Calendar, Baby, UserMinus, Star, Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface TimelineProps {
    events: TimelineEvent[];
    onDelete?: (event: TimelineEvent) => void;
}

export default function Timeline({ events, onDelete }: TimelineProps) {
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
            default: return <Star className="w-5 h-5 text-primary" />;
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
        <div className="relative border-r border-line mr-6 space-y-12">
            {events.map((event) => (
                <div key={event.id} className="relative pr-8">
                    {/* Timeline Dot */}
                    <div className="absolute top-0 -right-3 w-6 h-6 rounded-full bg-white border-4 border-primary shadow-sm z-10" />

                    {/* Content Card */}
                    <div className={`p-5 rounded-2xl border transition-all hover:shadow-md ${getBgColor(event.type)}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                    {getIcon(event.type)}
                                </div>
                                {event.title}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-sm font-bold text-gray-500 bg-white/50 px-2 py-1 rounded-lg">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {event.year} هـ
                                </span>
                                {onDelete && (
                                    <button
                                        type="button"
                                        onClick={() => onDelete(event)}
                                        aria-label={`حذف ${event.title}`}
                                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {event.description && (
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                {event.description}
                            </p>
                        )}

                        {event.memberId && (
                            <Link
                                href={`/portal/members/${event.memberId}`}
                                className="inline-flex items-center text-xs font-bold text-primary hover:underline"
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
