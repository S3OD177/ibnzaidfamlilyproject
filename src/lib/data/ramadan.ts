import "server-only";
import { extractRamadanXHandle } from "@/lib/ramadan-x";
import { asc, desc, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";
import { competitionLive, roundState, type RamadanView } from "@/lib/ramadan";

export async function listRamadan(admin = false): Promise<RamadanView[]> {
    const me = admin ? await requireRole("admin") : await requireRole("member", "editor", "admin");
    const db = getDb();
    const now = Date.now();
    const competitions = (await db.select().from(schema.ramadanCompetitions).orderBy(desc(schema.ramadanCompetitions.createdAt)))
        .filter(c => admin || competitionLive(c, now));
    if (!competitions.length) return [];
    const rounds = await db.select().from(schema.ramadanRounds).where(inArray(schema.ramadanRounds.competitionId, competitions.map(c => c.id))).orderBy(asc(schema.ramadanRounds.opensAt));
    const answers = rounds.length ? await db.select().from(schema.ramadanAnswers).where(inArray(schema.ramadanAnswers.roundId, rounds.map(r => r.id))) : [];
    return competitions.map(c => {
        const ownRounds = rounds.filter(r => r.competitionId === c.id);
        return {
            questionCount: c.questionCount, intervalHours: c.intervalHours, durationHours: c.durationHours,
            id: c.id, title: c.title, description: c.description, enabled: c.enabled, visibleAt: c.visibleAt.toISOString(),
            rounds: ownRounds.map(r => ({
                id: r.id, title: r.title, points: r.points,
                question: admin || roundState(r, now) !== "upcoming" ? r.question : null,
                options: admin || roundState(r, now) !== "upcoming" ? r.options : [],
                opensAt: r.opensAt.toISOString(), closesAt: r.closesAt.toISOString(),
                manuallyClosed: r.manuallyClosed, resultsPublished: r.resultsPublished,
                correctIndex: admin || r.resultsPublished ? r.correctIndex : null,
                myAnswer: answers.find(a => a.roundId === r.id && a.userId === me.userId)?.optionIndex ?? null,
                winnerName: admin || r.resultsPublished ? r.winnerName : null,
                drawnAt: admin || r.resultsPublished ? r.drawnAt?.toISOString() ?? null : null,
                candidates: admin ? answers.filter(a => a.roundId === r.id).map(a => ({ id: a.id, name: a.participantName, xHandle: extractRamadanXHandle(a.xHandle), correct: a.optionIndex === r.correctIndex, rulesApproved: a.rulesApproved })) : [],
                answerCount: answers.filter(a => a.roundId === r.id).length,
            })),
        };
    });
}

export async function ramadanServerNow() { return Date.now(); }
