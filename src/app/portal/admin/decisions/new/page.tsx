import DecisionEditor from "@/components/admin/decisions/DecisionEditor";
import { DECISION_STATES, DECISION_TYPES } from "@/lib/data/decisions";

export default function NewDecisionPage() {
    return (
        <DecisionEditor
            types={DECISION_TYPES}
            states={DECISION_STATES}
            attachmentName={null}
            initial={{ referenceNumber: "", title: "", body: "", decisionType: "", hijriYear: "", issuedAt: "", keywords: "", state: "active", attachmentFileId: null }}
        />
    );
}
