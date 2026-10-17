export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    type: 'birthday' | 'death' | 'custom' | 'event';
    memberId?: string;
    description?: string;
    color?: string; // Optional: for custom UI colors
    category?: string; // e.g. 'meeting'
    categoryLabel?: string; // e.g. 'اجتماع'
}

// Group events by day for easier rendering
export interface EventsByDate {
    [key: string]: CalendarEvent[]; // key format: 'YYYY-MM-DD'
}
