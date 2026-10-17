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
