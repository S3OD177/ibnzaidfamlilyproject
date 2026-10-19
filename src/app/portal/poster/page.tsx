import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TreePoster, { PAPER, type PaperSize, type PosterStyle } from "@/components/poster/TreePoster";
import { getSession, getViewer } from "@/lib/auth/current";
import { getTreeView } from "@/lib/data/tree";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ملصق شجرة العائلة" };

// Full-screen print page, outside the portal frame so only the poster prints.
export default async function PosterPage({ searchParams }: { searchParams: Promise<{ root?: string; size?: string; style?: string }> }) {
    const session = await getSession();
    if (!session) redirect("/portal/login?next=/portal/poster");
    const { root, size, style } = await searchParams;
    const [tree, site] = await Promise.all([getTreeView(await getViewer()), getSiteSettings()]);
    const parents = new Set(tree.edges.map((e) => e.source));
    const branchOptions = tree.nodes.filter((n) => parents.has(n.id)).map((n) => ({ id: n.id, name: n.data.label }));
    const rootId = root && tree.nodes.some((n) => n.id === root) ? root : null;
    const paper: PaperSize = size && size in PAPER ? (size as PaperSize) : "A3";
    const posterStyle: PosterStyle = style === "fan" ? "fan" : "tree";

    return <TreePoster tree={tree} siteName={site.siteName} rootId={rootId} paper={paper} posterStyle={posterStyle} branchOptions={branchOptions} />;
}
