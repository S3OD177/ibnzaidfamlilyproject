export type EventType = 'birth' | 'death' | 'marriage' | 'achievement' | 'milestone';

export interface TimelineEvent {
    id: string;
    year: number;
    title: string;
    description?: string;
    type: EventType;
    memberId?: string; // Related member
    imageUrl?: string;
}
