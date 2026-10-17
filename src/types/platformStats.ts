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
