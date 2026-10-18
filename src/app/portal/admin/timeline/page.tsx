import TimelineManager from "@/components/timeline/TimelineManager";
import { listTimelineEvents } from "@/lib/data/events";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
    const events = await listTimelineEvents();

    return (
        <div className="min-h-screen bg-canvas pb-20 p-8" dir="rtl">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-ink">السجل التاريخي</h1>
                    <p className="text-gray-500 mt-2">توثيق زمني لأهم أحداث العائلة</p>
                </div>

                <TimelineManager initialEvents={events} />
            </div>
        </div>
    );
}
