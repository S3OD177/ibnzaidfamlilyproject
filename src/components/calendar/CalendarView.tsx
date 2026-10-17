"use client";

import React, { useMemo, useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import EventList from '@/components/calendar/EventList';
import AddEventModal from '@/components/calendar/AddEventModal';
import { CalendarEvent } from '@/types/calendar';
import type { StoredEvent } from '@/lib/data/events';
import { addEvent, deleteEvent } from '@/app/portal/admin/calendar/actions';
import { unwrap } from '@/lib/action-result';

// "YYYY-MM-DD" <-> local Date, so an event never shifts a day across time zones.
const toLocalDate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
};
const toIso = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const toCalendarEvent = (e: StoredEvent): CalendarEvent => ({
    id: e.id,
    title: e.title,
    description: e.description ?? undefined,
    date: toLocalDate(e.date),
    type: 'event',
    category: e.category,
    categoryLabel: e.categoryLabel,
    color: e.color,
});

export default function CalendarView({ initialEvents }: { initialEvents: StoredEvent[] }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stored, setStored] = useState(initialEvents);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const events = useMemo(() => stored.map(toCalendarEvent), [stored]);

    const handleAddEvent = (newEvent: Partial<CalendarEvent>) => {
        setError(null);
        startTransition(async () => {
            try {
                const saved = await unwrap(addEvent({
                    title: newEvent.title ?? '',
                    description: newEvent.description ?? '',
                    date: toIso(newEvent.date ?? selectedDate),
                    category: newEvent.category ?? 'general',
                }));
                setStored((prev) => [...prev, saved]);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'تعذر حفظ الحدث');
            }
        });
    };

    const handleDelete = (event: CalendarEvent) => {
        if (!confirm(`حذف "${event.title}"؟`)) return;
        setError(null);
        startTransition(async () => {
            try {
                await unwrap(deleteEvent(event.id));
                setStored((prev) => prev.filter((e) => e.id !== event.id));
            } catch (e) {
                setError(e instanceof Error ? e.message : 'تعذر الحذف');
            }
        });
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-[#111814] mb-2">التقويم العائلي</h1>
                    <p className="text-[#618975] text-sm">تتبع المناسبات والاجتماعات والفعاليات العائلية.</p>
                    {pending && <p className="text-xs font-bold text-blue-600 mt-2">جارٍ الحفظ...</p>}
                    {error && <p className="text-xs font-bold text-red-600 mt-2">{error}</p>}
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>إضافة حدث</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
                {/* Main Calendar Grid */}
                <div className="lg:col-span-2 h-full">
                    <CalendarGrid
                        events={events}
                        onDateSelect={setSelectedDate}
                        selectedDate={selectedDate}
                    />
                </div>

                {/* Side Panel for Event Details */}
                <div className="h-full">
                    <EventList
                        events={events}
                        selectedDate={selectedDate}
                        onDelete={handleDelete}
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
