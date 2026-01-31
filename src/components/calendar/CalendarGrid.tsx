"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';

interface CalendarGridProps {
    events: CalendarEvent[];
    onDateSelect: (date: Date) => void;
    selectedDate: Date;
}

export default function CalendarGrid({ events, onDateSelect, selectedDate }: CalendarGridProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];

    const weekDays = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const renderDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month); // 0 (Sun) - 6 (Sat)

        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/30 border border-gray-100/50"></div>);
        }

        // Days of current month
        for (let d = 1; d <= totalDays; d++) {
            const date = new Date(year, month, d);
            const isToday = new Date().toDateString() === date.toDateString();
            const isSelected = selectedDate.toDateString() === date.toDateString();

            // Check for events
            const dayEvents = events.filter(e =>
                e.date.getDate() === d &&
                e.date.getMonth() === month &&
                e.date.getFullYear() === year
            );

            days.push(
                <div
                    key={d}
                    onClick={() => onDateSelect(date)}
                    className={`h-24 border border-gray-100 p-2 cursor-pointer transition-colors relative hover:bg-gray-50
                        ${isToday ? 'bg-blue-50/30' : 'bg-white'}
                        ${isSelected ? 'ring-2 ring-[#D4AF37] ring-inset z-10' : ''}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full 
                            ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}
                        `}>
                            {d}
                        </span>
                        {dayEvents.length > 0 && (
                            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full">
                                {dayEvents.length}
                            </span>
                        )}
                    </div>

                    {/* Event Dots/Previews */}
                    <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map((ev, idx) => (
                            <div key={idx} className={`text-[9px] truncate px-1 rounded ${ev.color || 'bg-gray-100 text-gray-600'}`}>
                                {ev.title}
                            </div>
                        ))}
                        {dayEvents.length > 2 && (
                            <div className="text-[9px] text-gray-400 pr-1">+{dayEvents.length - 2} المزيد</div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#fcfdfc]">
                <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>
                <h2 className="text-xl font-bold text-[#111814]">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div>
                    <button
                        onClick={() => { setCurrentDate(new Date()); onDateSelect(new Date()); }}
                        className="px-3 py-1 text-xs font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                        اليوم
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 text-center">
                {/* Weekday Headers */}
                {weekDays.map((day) => (
                    <div key={day} className="py-3 text-xs font-bold text-gray-400 bg-gray-50 border-b border-gray-100">
                        {day}
                    </div>
                ))}

                {/* Calendar Days */}
                {renderDays()}
            </div>
        </div>
    );
}
