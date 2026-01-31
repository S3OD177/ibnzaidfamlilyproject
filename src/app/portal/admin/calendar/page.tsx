"use client";

import React, { useState, useMemo } from 'react';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import EventList from '@/components/calendar/EventList';
import AddEventModal from '@/components/calendar/AddEventModal';
import { generateCalendarEvents } from '@/lib/calendar/calendarUtils';
import { Member } from '@/types/member';
import { Plus } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';

// Mock Data for Demo
const mockMembers: Member[] = [
    {
        id: '1', label: 'أحمد بن عبدالله', gender: 'male', status: 'alive',
        birthDate: { day: '15', month: '1', year: '1405', type: 'Hijri' }
    },
    {
        id: '2', label: 'محمد بن زايد', gender: 'male', status: 'deceased',
        deathDate: { day: '10', month: '2', year: '1420', type: 'Hijri' } // Feb 10
    },
    {
        id: '3', label: 'سارة بنت خالد', gender: 'female', status: 'alive',
        birthDate: { day: '2', month: '2', year: '1410', type: 'Hijri' } // Feb 2
    },
    {
        id: '4', label: 'عبدالرحمن بن أحمد', gender: 'male', status: 'alive',
        birthDate: { day: '28', month: '1', year: '1415', type: 'Hijri' } // Jan 28
    },
    {
        id: '5', label: 'نورة بنت محمد', gender: 'female', status: 'alive',
        birthDate: { day: '5', month: '2', year: '1418', type: 'Hijri' } // Feb 5
    }
];

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);

    // In a real app, fetch members from API/Context
    const memberEvents = useMemo(() => generateCalendarEvents(mockMembers), []);

    // Combine auto-generated member events with manually added custom events
    const allEvents = [...memberEvents, ...customEvents];

    const handleAddEvent = (newEvent: Partial<CalendarEvent>) => {
        const event: CalendarEvent = {
            id: `custom-${Date.now()}`,
            title: newEvent.title || 'حدث جديد',
            date: newEvent.date || new Date(),
            type: newEvent.type || 'custom',
            description: newEvent.description,
            color: newEvent.color
        };
        setCustomEvents([...customEvents, event]);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-[#111814] mb-2">التقويم العائلي</h1>
                    <p className="text-[#618975] text-sm">تتبع المناسبات العائلية، أعياد الميلاد، والذكريات السنوية.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>إضافة حدث</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
                {/* Main Calendar Grid */}
                <div className="lg:col-span-2 h-full">
                    <CalendarGrid
                        events={allEvents}
                        onDateSelect={setSelectedDate}
                        selectedDate={selectedDate}
                    />
                </div>

                {/* Side Panel for Event Details */}
                <div className="h-full">
                    <EventList
                        events={allEvents}
                        selectedDate={selectedDate}
                    />
                </div>
            </div>

            <AddEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddEvent}
                selectedDate={selectedDate}
            />
        </div>
    );
}
