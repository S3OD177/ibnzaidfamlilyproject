import { PageSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="max-w-6xl w-full mx-auto px-4 py-10">
            <PageSkeleton />
        </div>
    );
}
