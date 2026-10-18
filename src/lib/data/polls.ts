import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { PollView } from "@/lib/polls";

/**
 * Polls with this viewer's ballot. Counts are hidden until the poll's results rule
 * allows; staff always see them, and see voter names on polls that are not anonymous.
 */
export async function listPolls({ viewerKey, staff = false, onlyOpen = false, limit = 50 }: { viewerKey: string; staff?: boolean; onlyOpen?: boolean; limit?: number }): Promise<PollView[]> {
    const db = getDb();
    const rows = await db.select().from(schema.polls).orderBy(desc(schema.polls.createdAt)).limit(limit);
    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);
    const [options, votes] = await Promise.all([
        db.select().from(schema.pollOptions).where(inArray(schema.pollOptions.pollId, ids)).orderBy(asc(schema.pollOptions.sortOrder)),
        db.select().from(schema.pollVotes).where(inArray(schema.pollVotes.pollId, ids)),
    ]);

    const now = Date.now();
    const result: PollView[] = rows.map((poll) => {
        const closed = Boolean(poll.closedAt) || Boolean(poll.closesAt && poll.closesAt.getTime() <= now);
        const pollVotes = votes.filter((v) => v.pollId === poll.id);
        const myChoices = pollVotes.filter((v) => v.voterKey === viewerKey).map((v) => v.optionId);
        const showResults = staff || closed || poll.results === "always" || (poll.results === "after_vote" && myChoices.length > 0);
        const showNames = staff && !poll.anonymous;
        return {
            id: poll.id,
            question: poll.question,
            description: poll.description,
            multiple: poll.multiple,
            anonymous: poll.anonymous,
            results: poll.results,
            closesAt: poll.closesAt?.toISOString() ?? null,
            closed,
            totalVoters: new Set(pollVotes.map((v) => v.voterKey)).size,
            myChoices,
            showResults,
            options: options
                .filter((o) => o.pollId === poll.id)
                .map((o) => {
                    const forOption = pollVotes.filter((v) => v.optionId === o.id);
                    return {
                        id: o.id,
                        label: o.label,
                        votes: showResults ? forOption.length : null,
                        voters: showNames ? forOption.map((v) => v.voterName) : null,
                    };
                }),
        };
    });
    return onlyOpen ? result.filter((p) => !p.closed) : result;
}

export async function pollExists(id: string) {
    const [row] = await getDb().select({ id: schema.polls.id }).from(schema.polls).where(eq(schema.polls.id, id));
    return Boolean(row);
}
