export interface MemberDate {
    day: string; // '1'
    month: string; // '1'
    year: string; // '1400'
    type: 'Hijri' | 'Gregorian';
}

/** A relative shown on a member card, computed from the tree edges. */
export interface RelativeRef {
    id: string;
    label: string;
    gender: 'male' | 'female';
    birthDate?: MemberDate;
}

export interface Relatives {
    children: RelativeRef[];
    siblings: RelativeRef[];
    parents: RelativeRef[];
}

export interface Member {
    id?: string;
    label: string; // Full Name
    gender: 'male' | 'female';
    status: 'alive' | 'deceased' | 'unknown';
    photo?: string; // Base64
    role?: string; // generation label in the tree
    wifeName?: string;
    isDeceased?: boolean; // Computed or explicit

    // Basic Info
    mobile?: string;
    email?: string;
    website?: string;
    location?: string;
    country?: string; // e.g. 'SA', 'KW'

    // Personal Dates
    birthDate?: MemberDate;
    deathDate?: MemberDate;

    // Profile Extended (Phase 2)
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
    numberOfChildren?: number;

    // Professional
    occupation?: string;
    company?: string;
    education?: string; // Degree / Major
    university?: string;

    // Social Media
    socialMedia?: {
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        website?: string;
    };

    // Additional / Meta
    nickname?: string;
    branch?: string;
    generationMark?: string;
    siblingOrder?: string;
    bio?: string;
    serialNumber?: string;
    level?: string;

    // Interests (comma separated string in UI often, but array here if parsed)
    interests?: string[];

    // Relatives (Tree Context - Dynamic)
    relatives?: Relatives;
}

// Helper to get default empty member
export const defaultMember: Partial<Member> = {
    label: '',
    gender: 'male',
    status: 'alive',
    birthDate: { day: '', month: '', year: '', type: 'Hijri' },
    deathDate: { day: '', month: '', year: '', type: 'Hijri' },
    socialMedia: {},
    interests: []
};
