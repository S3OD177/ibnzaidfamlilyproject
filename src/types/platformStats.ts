export interface PlatformStats {
    users: {
        total: number;
        active: number;
        pending: number;
    };
    content: {
        newsUrl: number;
        documents: number;
        events: number;
    };

    system: {
        status: 'Operational' | 'Maintenance' | 'Down';
        lastBackup: string;
        version: string;
    };
}

export const mockPlatformStats: PlatformStats = {
    users: {
        total: 1250,
        active: 890,
        pending: 12
    },
    content: {
        newsUrl: 45,
        documents: 128,
        events: 12
    },

    system: {
        status: 'Operational',
        lastBackup: '2024-01-30 02:00 AM',
        version: 'v2.1.0'
    }
};
