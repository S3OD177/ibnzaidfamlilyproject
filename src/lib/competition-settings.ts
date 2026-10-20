export interface CompetitionSettings { questionCount: number; intervalHours: number; durationHours: number }
export function validateCompetitionSettings(value: CompetitionSettings) {
    if (!Number.isInteger(value.questionCount) || value.questionCount < 1 || value.questionCount > 100) throw new Error("عدد الأسئلة يجب أن يكون بين 1 و100");
    if (!Number.isInteger(value.intervalHours) || value.intervalHours < 1 || value.intervalHours > 8760) throw new Error("الفاصل بين بدايات الأسئلة يجب أن يكون بين ساعة و8760 ساعة");
    if (!Number.isInteger(value.durationHours) || value.durationHours < 1 || value.durationHours > value.intervalHours) throw new Error("مدة الإجابة يجب أن تكون ساعة على الأقل ولا تتجاوز الفاصل بين الأسئلة");
    return { questionCount: value.questionCount, intervalHours: value.intervalHours, durationHours: value.durationHours };
}
