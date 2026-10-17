import CalendarView from "@/components/calendar/CalendarView";
import { listEvents } from "@/lib/data/events";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
    return <CalendarView initialEvents={await listEvents()} />;
}
