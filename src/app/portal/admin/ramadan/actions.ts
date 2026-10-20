"use server";
import { validateCompetitionQuestions, type CompetitionQuestion } from "@/lib/competition-questions";
import { validateCompetitionSettings, type CompetitionSettings } from "@/lib/competition-settings";
import { extractRamadanXHandle } from "@/lib/ramadan-x";
import { revalidatePath } from "next/cache";
import { eq, sql, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";
import { ActionError, safeAction } from "@/lib/action-result";
import { parseRiyadh, roundState } from "@/lib/ramadan";

function refresh() {
    revalidatePath("/portal/admin/ramadan"); revalidatePath("/portal/ramadan"); revalidatePath("/portal");
}
function idCheck(id: string) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new ActionError("معرّف غير صالح");
}
function date(value: string) { try { return parseRiyadh(value); } catch { throw new ActionError("أدخل تاريخاً ووقتاً صحيحين بتوقيت الرياض"); } }
function text(value: string, max: number) {
    if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new ActionError(`النص مطلوب وبحد أقصى ${max} حرف`);
    return value.trim();
}
function settings(value: CompetitionSettings) { try { return validateCompetitionSettings(value); } catch (e) { throw new ActionError(e instanceof Error ? e.message : "راجع الجدولة"); } }
export async function saveCompetition(input: CompetitionSettings & { id?: string; title: string; description: string; enabled: boolean; visibleAt: string }) {
    return safeAction(async () => {
        await requireRole("admin");
        const values = { ...settings(input), title: text(input.title, 150), description: input.description.trim().slice(0, 2000), enabled: Boolean(input.enabled), visibleAt: date(input.visibleAt) };
        if (input.id) {
            idCheck(input.id);
            await getDb().transaction(async tx => {
                const [c] = await tx.select().from(schema.ramadanCompetitions).where(eq(schema.ramadanCompetitions.id, input.id!)).for("update");
                if (!c) throw new ActionError("المسابقة غير موجودة");
                const rounds = await tx.select().from(schema.ramadanRounds).where(eq(schema.ramadanRounds.competitionId,c.id)).orderBy(schema.ramadanRounds.opensAt).for("update");
                if (rounds.length > values.questionCount) throw new ActionError("عدد الأسئلة لا يمكن أن يقل عن عدد الأسئلة الموجودة");
                if (c.intervalHours !== values.intervalHours || c.durationHours !== values.durationHours) {
                    const answered = await tx.select({roundId:schema.ramadanAnswers.roundId}).from(schema.ramadanAnswers).innerJoin(schema.ramadanRounds,eq(schema.ramadanAnswers.roundId,schema.ramadanRounds.id)).where(eq(schema.ramadanRounds.competitionId,c.id));
                    const upcoming = rounds.filter(r => !answered.some(a=>a.roundId===r.id) && r.opensAt.getTime() > Date.now() && !r.manuallyClosed && !r.resultsPublished && !r.drawnAt);
                    const base = upcoming[0]?.opensAt.getTime();
                    for (let i=0; i<upcoming.length; i++) {
                        const opensAt = new Date(base! + i*values.intervalHours*3600000);
                        await tx.update(schema.ramadanRounds).set({ opensAt, closesAt:new Date(opensAt.getTime()+values.durationHours*3600000) }).where(eq(schema.ramadanRounds.id,upcoming[i].id));
                    }
                }
                await tx.update(schema.ramadanCompetitions).set(values).where(eq(schema.ramadanCompetitions.id,c.id));
            });
        } else await getDb().insert(schema.ramadanCompetitions).values(values);
        refresh();
    });
}
export async function saveRound(input: { id?: string; competitionId: string; title: string; question: string; options: string[]; correctIndex: number; points: number; opensAt: string; closesAt: string }) {
    return safeAction(async () => {
        await requireRole("admin"); idCheck(input.competitionId);
        const opensAt = date(input.opensAt), closesAt = date(input.closesAt);
        if (closesAt <= opensAt) throw new ActionError("وقت الإغلاق يجب أن يكون بعد وقت الفتح");
        const options = input.options.map(o => text(o, 250));
        if (options.length < 2 || options.length > 6 || new Set(options).size !== options.length) throw new ActionError("أضف من خيارين إلى ستة خيارات مختلفة");
        if (!Number.isInteger(input.correctIndex) || input.correctIndex < 0 || input.correctIndex >= options.length) throw new ActionError("اختر الإجابة الصحيحة");
        if (!Number.isInteger(input.points) || input.points < 1 || input.points > 100) throw new ActionError("النقاط بين 1 و100");
        const values = { competitionId: input.competitionId, title: text(input.title,150), question: text(input.question,1000), options, correctIndex: input.correctIndex, points: input.points, opensAt, closesAt };
        await getDb().transaction(async tx => {
            const [competition] = await tx.select().from(schema.ramadanCompetitions).where(eq(schema.ramadanCompetitions.id,input.competitionId)).for("update");
            if (!competition) throw new ActionError("المسابقة غير موجودة");
            if (!input.id) {
                const existing = await tx.select({id:schema.ramadanRounds.id}).from(schema.ramadanRounds).where(eq(schema.ramadanRounds.competitionId,input.competitionId));
                if (existing.length >= competition.questionCount) throw new ActionError("وصلت لعدد الأسئلة المحدد. عدّله من إعدادات المسابقة لإضافة المزيد");
            }
            if (input.id) {
                idCheck(input.id);
                const [old] = await tx.select().from(schema.ramadanRounds).where(eq(schema.ramadanRounds.id,input.id)).for("update");
                if (!old || old.competitionId !== input.competitionId) throw new ActionError("السؤال غير موجود");
                const [answer] = await tx.select({ id: schema.ramadanAnswers.id }).from(schema.ramadanAnswers).where(eq(schema.ramadanAnswers.roundId,old.id)).limit(1);
                if (old.resultsPublished || answer || old.opensAt.getTime() <= Date.now()) throw new ActionError("لا يمكن تعديل السؤال بعد فتح السؤال؛ استخدم أدوات التوقيت");
                await tx.update(schema.ramadanRounds).set(values).where(eq(schema.ramadanRounds.id,old.id));
            } else await tx.insert(schema.ramadanRounds).values(values);
        });
        refresh();
    });
}
export async function controlRound(id: string, action: "open" | "close" | "schedule" | "publish", timing?: { opensAt: string; closesAt: string }) {
    return safeAction(async () => {
        await requireRole("admin"); idCheck(id);
        await getDb().transaction(async tx => {
            const [r] = await tx.select().from(schema.ramadanRounds).where(eq(schema.ramadanRounds.id,id)).for("update");
            if (!r) throw new ActionError("السؤال غير موجود");
            if (r.drawnAt && action !== "publish") throw new ActionError("أُجري السحب؛ يمكن نشر النتائج فقط");
            if (r.resultsPublished) throw new ActionError("نُشرت النتائج، ولا يمكن إعادة فتح السؤال");
            const [{ now }] = await tx.execute<{ now: string }>(sql`select clock_timestamp() as now`);
            const current = new Date(now);
            if (action === "close") await tx.update(schema.ramadanRounds).set({ manuallyClosed: true }).where(eq(schema.ramadanRounds.id,id));
            else if (action === "publish") {
                if (roundState(r,current.getTime()) !== "closed") throw new ActionError("أغلق الإجابات قبل نشر النتائج");
                await tx.update(schema.ramadanRounds).set({ resultsPublished: true, manuallyClosed: true }).where(eq(schema.ramadanRounds.id,id));
            } else if (action === "schedule" || action === "open") {
                if (!timing) throw new ActionError("حدد مواعيد السؤال");
                const opensAt = action === "open" ? current : date(timing.opensAt);
                const closesAt = date(timing.closesAt);
                if (closesAt <= opensAt || closesAt <= current) throw new ActionError("اختر وقت إغلاق مستقبلي بعد وقت الفتح");
                await tx.update(schema.ramadanRounds).set({ opensAt, closesAt, manuallyClosed: false }).where(eq(schema.ramadanRounds.id,id));
            } else throw new ActionError("إجراء غير صالح");
        });
        refresh();
    });
}

/** Eligibility is an explicit admin review, not a participant self-declaration. */
export async function approveRamadanRules(roundId: string, answerId: string, approved: boolean) {
    return safeAction(async () => {
        await requireRole("admin"); idCheck(roundId); idCheck(answerId);
        if (typeof approved !== "boolean") throw new ActionError("قيمة غير صالحة");
        await getDb().transaction(async tx => {
            const [r] = await tx.select().from(schema.ramadanRounds).where(eq(schema.ramadanRounds.id,roundId)).for("update");
            if (!r || r.drawnAt) throw new ActionError("لا يمكن تغيير الأهلية بعد السحب");
            if (roundState(r) === "open" || roundState(r) === "upcoming") throw new ActionError("أغلق الإجابات على السؤال قبل مراجعة المشاركين");
            const [a] = await tx.select().from(schema.ramadanAnswers).where(eq(schema.ramadanAnswers.id,answerId));
            if (!a || a.roundId !== roundId || a.optionIndex !== r.correctIndex) throw new ActionError("يجب أن تكون الإجابة صحيحة للدخول في السحب");
            if (approved && !extractRamadanXHandle(a.xHandle)) throw new ActionError("حساب X مفقود أو غير صالح؛ المشارك غير مؤهل للسحب");
            await tx.update(schema.ramadanAnswers).set({ rulesApproved: approved }).where(eq(schema.ramadanAnswers.id,answerId));
        });
        refresh();
    });
}

export async function drawRamadanWinner(roundId: string) {
    return safeAction(async () => {
        const me = await requireRole("admin"); idCheck(roundId);
        await getDb().transaction(async tx => {
            const [r] = await tx.select().from(schema.ramadanRounds).where(eq(schema.ramadanRounds.id,roundId)).for("update");
            if (!r) throw new ActionError("السؤال غير موجود");
            if (r.drawnAt) throw new ActionError("أُجري السحب بالفعل ولا يمكن تكراره");
            if (roundState(r) === "open" || roundState(r) === "upcoming") throw new ActionError("أغلق الإجابات على السؤال قبل إجراء السحب");
            const answers = await tx.select().from(schema.ramadanAnswers).where(eq(schema.ramadanAnswers.roundId,roundId));
            const eligible = answers.filter(a => a.rulesApproved && a.optionIndex === r.correctIndex && Boolean(extractRamadanXHandle(a.xHandle)));
            if (!eligible.length) throw new ActionError("لا يوجد مشاركون مؤهلون؛ راجع استيفاء الشروط أولاً");
            const { randomInt } = await import("node:crypto");
            const winner = eligible[randomInt(eligible.length)];
            await tx.update(schema.ramadanRounds).set({
                winnerUserId: winner.userId, winnerName: winner.participantName,
                drawnAt: new Date(), drawnBy: me.displayName,
                drawPool: eligible.map(a => a.id), manuallyClosed: true,
            }).where(eq(schema.ramadanRounds.id,roundId));
        });
        refresh();
    });
}

/** Copies content only. Participation, draws and publication state are never copied. */
export async function createRamadanCompetition(input: CompetitionSettings & { questions?: CompetitionQuestion[]; sourceId?: string; title: string; description: string; visibleAt: string; startsAt: string }) {
    return safeAction(async () => {
        await requireRole("admin");
        const config = settings(input);
        const title = text(input.title, 150);
        const visibleAt = date(input.visibleAt);
        const startsAt = date(input.startsAt);
        if (startsAt.getTime() <= Date.now()) throw new ActionError("اختر موعد بداية مستقبلياً");
        if (visibleAt > startsAt) throw new ActionError("موعد الظهور يجب أن يسبق أول سؤال أو يوافقه");
        if (input.sourceId) idCheck(input.sourceId);
        let newQuestions: CompetitionQuestion[] = [];
        if (!input.sourceId) {
            try { newQuestions = validateCompetitionQuestions(input.questions,config.questionCount); }
            catch (e) { throw new ActionError(e instanceof Error ? e.message : "أكمل الأسئلة"); }
        }
        const id = await getDb().transaction(async tx => {
            let sourceQuestions: (typeof schema.ramadanRounds.$inferSelect)[] = [];
            if (input.sourceId) {
                const [source] = await tx.select().from(schema.ramadanCompetitions).where(eq(schema.ramadanCompetitions.id, input.sourceId)).for("share");
                if (!source) throw new ActionError("المسابقة الأصلية غير موجودة");
                sourceQuestions = await tx.select().from(schema.ramadanRounds).where(eq(schema.ramadanRounds.competitionId, source.id)).orderBy(schema.ramadanRounds.opensAt).for("share");
            }
            if (sourceQuestions.length > config.questionCount) throw new ActionError("عدد الأسئلة المحدد أقل من أسئلة المسابقة الأصلية");
            const [created] = await tx.insert(schema.ramadanCompetitions).values({ ...config, title, description: input.description.trim().slice(0, 2000), visibleAt, enabled: false }).returning({ id: schema.ramadanCompetitions.id });
            const allQuestions = input.sourceId ? sourceQuestions : newQuestions.map((q,index)=>({...q,title:`السؤال ${index+1}`,points:1}));
            if (allQuestions.length) await tx.insert(schema.ramadanRounds).values(allQuestions.map((q, index) => ({
                competitionId: created.id, title: q.title, question: q.question, options: q.options, correctIndex: q.correctIndex, points: q.points,
                opensAt: new Date(startsAt.getTime() + index * config.intervalHours * 3600000),
                closesAt: new Date(startsAt.getTime() + (index * config.intervalHours + config.durationHours) * 3600000),
            })));
            return created.id;
        });
        refresh();
        return { id };
    });
}

export async function deleteRamadanCompetition(input: { id: string; confirmation: string }) {
    return safeAction(async () => {
        await requireRole("admin"); idCheck(input.id);
        await getDb().transaction(async tx => {
            const [competition] = await tx.select().from(schema.ramadanCompetitions).where(eq(schema.ramadanCompetitions.id,input.id)).for("update");
            if (!competition) throw new ActionError("المسابقة غير موجودة أو حُذفت بالفعل");
            if (typeof input.confirmation !== "string" || input.confirmation.trim() !== competition.title) throw new ActionError("اكتب اسم المسابقة مطابقاً لتأكيد الحذف");
            // Foreign keys cascade only this competition's questions and answers.
            await tx.delete(schema.ramadanCompetitions).where(eq(schema.ramadanCompetitions.id,competition.id));
        });
        refresh();
    });
}

export async function approveAllCorrectRamadanAnswers(roundId: string) {
    return safeAction(async () => {
        await requireRole("admin"); idCheck(roundId);
        await getDb().transaction(async tx => {
            const [r] = await tx.select().from(schema.ramadanRounds).where(eq(schema.ramadanRounds.id,roundId)).for("update");
            if (!r) throw new ActionError("السؤال غير موجود");
            if (r.drawnAt) throw new ActionError("لا يمكن تغيير الأهلية بعد السحب");
            if (!["closed","results"].includes(roundState(r))) throw new ActionError("أغلق الإجابات على السؤال قبل مراجعة المشاركين");
            const answers = await tx.select().from(schema.ramadanAnswers).where(eq(schema.ramadanAnswers.roundId,roundId));
            const ids = answers.filter(a=>a.optionIndex===r.correctIndex && extractRamadanXHandle(a.xHandle) && !a.rulesApproved).map(a=>a.id);
            if (ids.length) await tx.update(schema.ramadanAnswers).set({rulesApproved:true}).where(inArray(schema.ramadanAnswers.id,ids));
        });
        refresh();
    });
}
