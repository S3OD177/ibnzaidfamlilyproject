import { Member } from '@/types/member';
import { CalendarEvent } from '@/types/calendar';

export const generateCalendarEvents = (members: Member[]): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const currentYear = new Date().getFullYear();

    members.forEach(member => {
        // Birthday (Approximate for MVP - Map Hijri Month/Day to current year Gregorian)
        // In a real app, use a proper Hijri->Gregorian converter library like 'hijri-converter'
        if (member.birthDate?.month && member.birthDate?.day) {
            const monthIndex = parseInt(member.birthDate.month) - 1; // 0-11
            const day = parseInt(member.birthDate.day);

            // Validate basic date
            if (monthIndex >= 0 && monthIndex <= 11 && day >= 1 && day <= 31) {
                events.push({
                    id: `bday-${member.id}`,
                    title: `عيد ميلاد ${member.label}`,
                    date: new Date(currentYear, monthIndex, day),
                    type: 'birthday',
                    memberId: member.id,
                    description: `يتم ${member.label} عاماً جديداً!`,
                    color: 'bg-blue-100 text-blue-700 border-blue-200'
                });
            }
        }

        // Death Anniversary
        if (member.status === 'deceased' && member.deathDate?.month && member.deathDate?.day) {
            const monthIndex = parseInt(member.deathDate.month) - 1;
            const day = parseInt(member.deathDate.day);

            if (monthIndex >= 0 && monthIndex <= 11 && day >= 1 && day <= 31) {
                events.push({
                    id: `death-${member.id}`,
                    title: `ذكرى وفاة ${member.label}`,
                    date: new Date(currentYear, monthIndex, day),
                    type: 'death',
                    memberId: member.id,
                    description: `اللهم ارحمه واغفر له.`,
                    color: 'bg-gray-100 text-gray-700 border-gray-200'
                });
            }
        }
    });

    // Add some mock custom events for demo
    events.push({
        id: 'evt-1',
        title: 'الاجتماع العائلي السنوي',
        date: new Date(currentYear, new Date().getMonth(), 15), // 15th of current month
        type: 'custom',
        description: 'الاجتماع في استراحة العائلة',
        color: 'bg-purple-100 text-purple-700 border-purple-200'
    });

    return events;
};

export const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
    return events.filter(e =>
        e.date.getDate() === date.getDate() &&
        e.date.getMonth() === date.getMonth() &&
        e.date.getFullYear() === date.getFullYear()
    );
};
