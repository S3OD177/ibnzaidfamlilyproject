// Polls as shown to a viewer. Shared by client and server.

export type PollResults = "always" | "after_vote" | "after_close";

export const RESULTS_LABELS: Record<PollResults, string> = {
    always: "تظهر النتائج للجميع دائماً",
    after_vote: "تظهر النتائج بعد التصويت",
    after_close: "تظهر النتائج بعد إغلاق التصويت",
};

export interface PollView {
    id: string;
    question: string;
    description: string | null;
    multiple: boolean;
    anonymous: boolean;
    results: PollResults;
    closesAt: string | null;
    closed: boolean;
    totalVoters: number;
    myChoices: string[];
    /** Whether this viewer may see the counts now. */
    showResults: boolean;
    options: { id: string; label: string; votes: number | null; voters: string[] | null }[];
}
