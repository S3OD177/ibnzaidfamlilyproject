"use client";

import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";

interface EventListProps {
    events: CalendarEvent[];
    selectedDate: Date;
}

export default function EventList({ events, selectedDate }: EventListProps) {
    // Filter events for selected date
    const dayEvents = events.filter(e =>
        e.date.toDateString() === selectedDate.toDateString()
    );

    const formattedDate = format(selectedDate, 'EEEE، d MMMM yyyy', { locale: arSA });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-[#fbfcfa]">
                <h3 className="text-lg font-bold text-[#111814] mb-1">أحداث اليوم</h3>
                <div className="flex items-center gap-2 text-[#618975] text-sm">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formattedDate}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {dayEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl text-gray-400 border border-dashed border-gray-200">
                        <Clock className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-sm font-medium">لا توجد أحداث في هذا اليوم</p>
                    </div>
                ) : (
                    dayEvents.map((event) => (
                        <div
                            key={event.id}
                            className={`p-4 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md bg-white ${event.color?.replace('bg-', 'border-') || 'border-gray-200'}`}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-[#111814]">{event.title}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${event.color || 'bg-gray-100 text-gray-600'}`}>
                                    {event.type}
                                </span>
                            </div>

                            {event.description && (
                                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                    {event.description}
                                </p>
                            )}
                        </div>
                    ))
                )}

                {/* Upcoming Events Section */}
                <div className="pt-6 mt-2 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        الأحداث القادمة هذا الشهر
                    </h4>
                    <div className="space-y-3">
                        {events
                            .filter(e => e.date > new Date() && e.date.getMonth() === new Date().getMonth())
                            .slice(0, 3)
                            .map((event, idx) => (
                                <div key={`upcoming-${idx}`} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                    <div className="text-center bg-white p-2 rounded border border-gray-200 min-w-[50px]">
                                        <span className="block text-[10px] text-gray-400">{format(event.date, 'MMM', { locale: arSA })}</span>
                                        <span className="block text-lg font-bold text-[#111814] leading-none">{format(event.date, 'd')}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#111814] line-clamp-1">{event.title}</p>
                                        <p className="text-[10px] text-gray-500">{event.type === 'birthday' ? 'عيد ميلاد' : 'مناسبات'}</p>
                                    </div>
                                </div>
                            ))}
                        {events.filter(e => e.date > new Date() && e.date.getMonth() === new Date().getMonth()).length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-4">لا توجد أحداث قادمة مسجلة لهذا الشهر.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
