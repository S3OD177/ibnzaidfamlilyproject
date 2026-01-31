import { Member } from '@/types/member';
import { Node } from '@xyflow/react';

export interface FamilyStats {
  totalMembers: number;
  livingCount: number;
  deceasedCount: number;
  genderDistribution: { name: string; value: number; fill: string }[];
  ageGroups: { name: string; value: number }[];
  averageChildren: number;
  generationsCount: number;
  topMaleNames: { name: string; count: number }[];
  topFemaleNames: { name: string; count: number }[];
  locationDistribution: { name: string; value: number }[];
}

export const calculateFamilyStats = (nodes: Node[]): FamilyStats => {
  const members = nodes.filter(n => n.type === 'familyMember').map(n => n.data as any as Member);

  // Total
  const totalMembers = members.length;

  // Status
  const livingCount = members.filter(m => m.status === 'alive').length;
  const deceasedCount = members.filter(m => m.status === 'deceased').length;

  // Gender
  const males = members.filter(m => m.gender === 'male').length;
  const females = members.filter(m => m.gender === 'female').length;
  const genderDistribution = [
    { name: 'ذكور', value: males, fill: '#3b82f6' },
    { name: 'إناث', value: females, fill: '#ec4899' },
  ];

  // Generations
  const generations = new Set(members.map(m => m.level || '1'));
  const generationsCount = generations.size;

  // Children Average
  const childrenCount = members.reduce((acc, m) => acc + (m.relatives?.children?.length || 0), 0);
  const averageChildren = totalMembers > 0 ? parseFloat((childrenCount / totalMembers).toFixed(1)) : 0;

  // Age Groups
  const ageGroups = [
    { name: '0-18', value: 0 },
    { name: '19-35', value: 0 },
    { name: '36-60', value: 0 },
    { name: '+60', value: 0 },
  ];

  const currentYear = 1445; // Hijri approx
  members.forEach(m => {
    if (m.birthDate?.year) {
      const age = currentYear - parseInt(m.birthDate.year);
      if (age <= 18) ageGroups[0].value++;
      else if (age <= 35) ageGroups[1].value++;
      else if (age <= 60) ageGroups[2].value++;
      else ageGroups[3].value++;
    }
  });

  // Top Names Helper
  const getTopNames = (gender: 'male' | 'female') => {
    const names: Record<string, number> = {};
    members.filter(m => m.gender === gender).forEach(m => {
      const firstName = m.label.trim().split(' ')[0];
      if (firstName) {
        names[firstName] = (names[firstName] || 0) + 1;
      }
    });
    return Object.entries(names)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const topMaleNames = getTopNames('male');
  const topFemaleNames = getTopNames('female');

  // Location Distribution
  const locations: Record<string, number> = {};
  members.forEach(m => {
    const loc = m.location || 'غير محدد';
    locations[loc] = (locations[loc] || 0) + 1;
  });
  const locationDistribution = Object.entries(locations)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    totalMembers,
    livingCount,
    deceasedCount,
    genderDistribution,
    ageGroups,
    averageChildren,
    generationsCount,
    topMaleNames,
    topFemaleNames,
    locationDistribution
  };
};
