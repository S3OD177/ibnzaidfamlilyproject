import { Member } from '@/types/member';
import { TimelineEvent } from '@/types/timeline';

export const generateTimelineEvents = (members: Member[]): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    members.forEach(member => {
        // Birth Event
        if (member.birthDate?.year) {
            events.push({
                id: `birth-${member.id}`,
                year: parseInt(member.birthDate.year),
                title: `ميلاد ${member.label}`,
                type: 'birth',
                memberId: member.id,
                description: `ولد في عام ${member.birthDate.year} هـ`
            });
        }

        // Death Event
        if (member.status === 'deceased' && member.deathDate?.year) {
            events.push({
                id: `death-${member.id}`,
                year: parseInt(member.deathDate.year),
                title: `وفاة ${member.label}`,
                type: 'death',
                memberId: member.id,
                description: `توفي رحمة الله عليه في عام ${member.deathDate.year} هـ`
            });
        }

        // Child Birth Events (Parenting)
        if (member.relatives?.children) {
            member.relatives.children.forEach((child: any) => {
                if (child.birthDate?.year) {
                    events.push({
                        id: `child-birth-${member.id}-${child.id}`,
                        year: parseInt(child.birthDate.year),
                        title: `رزق بـ ${child.label}`, // "Blessed with..."
                        type: 'milestone', // Using star icon for positive life events
                        memberId: member.id,
                        description: `في عام ${child.birthDate.year} هـ، رزق ${member.label} بمولوده ${child.label}`
                    });
                }
            });
        }
    });

    // Sort by year descending (newest first)
    return events.sort((a, b) => b.year - a.year);
};
