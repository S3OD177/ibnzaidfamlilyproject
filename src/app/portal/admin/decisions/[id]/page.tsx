import { notFound } from "next/navigation";
import DecisionEditor from "@/components/admin/decisions/DecisionEditor";
import { DECISION_STATES, DECISION_TYPES, getDecision } from "@/lib/data/decisions";

export const dynamic = "force-dynamic";

export default async function EditDecisionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const d = await getDecision(id);
    if (!d) notFound();
    // Keep an older type selectable even if it is no longer in the list.
    const types = DECISION_TYPES.includes(d.decisionType as (typeof DECISION_TYPES)[number]) ? DECISION_TYPES : [...DECISION_TYPES, d.decisionType];

    return (
        <DecisionEditor
            types={types}
            states={DECISION_STATES}
            attachmentName={d.attachmentName}
            initial={{
                id: d.id,
                referenceNumber: d.referenceNumber ?? "",
                title: d.title,
                body: d.body ?? "",
                decisionType: d.decisionType,
                hijriYear: d.hijriYear ? String(d.hijriYear) : "",
                issuedAt: d.issuedAt ?? "",
                keywords: d.keywords.join("، "),
                state: d.state,
                attachmentFileId: d.attachmentFileId,
            }}
        />
    );
}
