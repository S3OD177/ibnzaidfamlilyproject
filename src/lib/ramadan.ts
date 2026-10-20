export type RoundState = "upcoming" | "open" | "closed" | "results";
export function roundState(round: { opensAt: string | Date; closesAt: string | Date; manuallyClosed: boolean; resultsPublished: boolean }, now = Date.now()): RoundState {
    if (round.resultsPublished) return "results";
    if (round.manuallyClosed || now >= new Date(round.closesAt).getTime()) return "closed";
    return now < new Date(round.opensAt).getTime() ? "upcoming" : "open";
}
export function competitionLive(competition: { enabled: boolean; visibleAt: string | Date }, now = Date.now()) {
    return competition.enabled && new Date(competition.visibleAt).getTime() <= now;
}
/** datetime-local inputs are explicitly interpreted in Riyadh, never the host timezone. */
export function parseRiyadh(value: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("أدخل تاريخاً ووقتاً صحيحين");
    const date = new Date(`${value}:00+03:00`);
    if (!Number.isFinite(date.getTime()) || riyadhInput(date) !== value) throw new Error("التاريخ غير صالح");
    return date;
}
export function riyadhInput(date: Date | string): string {
    return new Date(new Date(date).getTime() + 3 * 3600000).toISOString().slice(0, 16);
}
export interface RamadanRoundView {
    id: string; title: string; question: string | null; options: string[];
    points: number; opensAt: string; closesAt: string; manuallyClosed: boolean; resultsPublished: boolean;
    correctIndex: number | null; myAnswer: number | null; answerCount: number;
    winnerName: string | null; drawnAt: string | null;
    candidates: { id: string; name: string; correct: boolean; xHandle: string | null; rulesApproved: boolean }[];
}
export interface RamadanView {
    questionCount: number; intervalHours: number; durationHours: number;
    id: string; title: string; description: string; enabled: boolean; visibleAt: string;
    rounds: RamadanRoundView[];

}
