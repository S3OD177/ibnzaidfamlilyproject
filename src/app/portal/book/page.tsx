import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BookControls from "@/components/book/BookControls";
import FamilyBook from "@/components/book/FamilyBook";
import { getSession, getViewer } from "@/lib/auth/current";
import { getTreeView } from "@/lib/data/tree";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "كتاب العائلة" };

// Full-screen print page, outside the portal frame so only the book prints.
export default async function BookPage({ searchParams }: { searchParams: Promise<{ root?: string; photos?: string }> }) {
    const session = await getSession();
    if (!session) redirect("/portal/login?next=/portal/book");
    const { root, photos } = await searchParams;
    const [tree, site] = await Promise.all([getTreeView(await getViewer()), getSiteSettings()]);
    const parents = new Set(tree.edges.map((e) => e.source));
    const branchOptions = tree.nodes
        .filter((n) => parents.has(n.id))
        .map((n) => ({ id: n.id, name: n.data.label }))
        .sort((a, b) => a.name.localeCompare(b.name, "ar"));
    const rootId = root && tree.nodes.some((n) => n.id === root) ? root : null;
    const withPhotos = photos === "1";

    return (
        <>
            <BookControls rootId={rootId} photos={withPhotos} branchOptions={branchOptions} />
            <FamilyBook tree={tree} siteName={site.siteName} rootId={rootId} photos={withPhotos} />
        </>
    );
}
