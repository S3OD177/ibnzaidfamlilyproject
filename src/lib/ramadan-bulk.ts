export interface BulkQuestion { question: string; options: string[]; correctIndex: number }

/** Blank lines separate questions; a leading * marks the one correct option. */
export function parseBulkQuestions(raw: unknown): BulkQuestion[] {
    if (typeof raw !== "string" || raw.length > 50000) throw new Error("نص الأسئلة كبير جداً أو غير صالح");
    const blocks = raw.trim().split(/\r?\n\s*\r?\n/).filter(Boolean);
    if (blocks.length !== 15) throw new Error(`أدخل 15 سؤالاً بالضبط. العدد الحالي: ${raw.trim() ? blocks.length : 0}`);
    return blocks.map((block, index) => {
        const [question, ...lines] = block.split(/\r?\n/).map(line => line.trim());
        const prefix = `السؤال ${index + 1}: `;
        if (!question || question.length > 1000) throw new Error(prefix + "اكتب سؤالاً لا يتجاوز 1000 حرف");
        if (lines.length < 2 || lines.length > 6) throw new Error(prefix + "أضف من خيارين إلى ستة خيارات، كل خيار في سطر");
        const marked = lines.map((line, i) => line.startsWith("*") ? i : -1).filter(i => i >= 0);
        if (marked.length !== 1) throw new Error(prefix + "ضع * قبل إجابة صحيحة واحدة فقط");
        const options = lines.map(line => line.replace(/^\*/, "").trim());
        if (options.some(o => !o || o.length > 250) || new Set(options).size !== options.length) throw new Error(prefix + "الخيارات يجب أن تكون مختلفة وغير فارغة ولا تتجاوز 250 حرفاً");
        return { question, options, correctIndex: marked[0] };
    });
}

/** 15 starts on days 1,3,...29. Each answer window lasts 24h, then a 24h break. */
export function bulkSchedule(start: Date) {
    if (!Number.isFinite(start.getTime())) throw new Error("تاريخ البداية غير صالح");
    const day = 24 * 60 * 60 * 1000;
    return Array.from({ length: 15 }, (_, i) => ({
        opensAt: new Date(start.getTime() + i * 2 * day),
        closesAt: new Date(start.getTime() + (i * 2 + 1) * day),
    }));
}
