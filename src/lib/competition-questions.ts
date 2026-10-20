export interface CompetitionQuestion { question: string; options: string[]; correctIndex: number }
export function validateCompetitionQuestions(value: unknown, count: number): CompetitionQuestion[] {
    if (!Array.isArray(value) || value.length !== count) throw new Error(`أكمل الأسئلة وعددها ${count}`);
    return value.map((item, index) => {
        const prefix = `السؤال ${index + 1}: `;
        if (!item || typeof item.question !== "string" || !item.question.trim() || item.question.trim().length > 1000) throw new Error(prefix + "اكتب نص السؤال (حتى 1000 حرف)");
        if (!Array.isArray(item.options) || item.options.length < 2 || item.options.length > 6 || item.options.some((o: unknown) => typeof o !== "string" || !o.trim() || o.trim().length > 250)) throw new Error(prefix + "أكمل من خيارين إلى ستة خيارات، حتى 250 حرفاً للخيار");
        const options: string[] = item.options.map((o: string) => o.trim());
        if (new Set(options).size !== options.length) throw new Error(prefix + "الخيارات يجب أن تكون مختلفة");
        if (!Number.isInteger(item.correctIndex) || item.correctIndex < 0 || item.correctIndex >= options.length) throw new Error(prefix + "حدد الإجابة الصحيحة");
        return { question: item.question.trim(), options, correctIndex: item.correctIndex };
    });
}
export function emptyCompetitionQuestion(): CompetitionQuestion { return { question: "", options: ["", "", "", ""], correctIndex: -1 }; }
