// Family tree model and layout, shared by the members' tree, the admin editor and the
// poster. Pure functions, no React. Layout is a tidy tree drawn right-to-left: the
// eldest child (by sibling order, then birth year) sits on the right; each person is
// a "unit" with their spouses beside them, and children hang from the couple.

export interface FamilyPerson {
    id: string;
    label: string;
    gender: "male" | "female";
    status: "alive" | "deceased" | "unknown";
    photo?: string;
    serialNumber?: string;
    role?: string; // generation label, e.g. "الجيل الثالث"
    branch?: string;
    siblingOrder?: number | null;
    birthYear?: number | null;
    deathYear?: number | null;
    yearSuffix?: "هـ" | "م";
}

export interface FamilyLink {
    id: string;
    source: string; // parent
    target: string; // child
}

export interface FamilyMarriage {
    id: string;
    memberId: string;
    spouseId: string | null;
    spouseName: string | null;
}

export interface SpouseRef {
    marriageId: string;
    /** Set when the spouse is also in the tree. */
    memberId: string | null;
    name: string;
    gender: "male" | "female" | null;
    photo?: string;
    /** The spouse also has their own card elsewhere (e.g. a daughter of another branch). */
    elsewhere: boolean;
}

export interface FamilyGraph {
    people: Map<string, FamilyPerson>;
    links: FamilyLink[];
    childrenOf: Map<string, string[]>; // unit id -> ordered children (by primary parent)
    parentsOf: Map<string, string[]>; // child -> all parents in the tree
    primaryParent: Map<string, string>; // child -> the unit it hangs from
    spousesOf: Map<string, SpouseRef[]>; // unit id -> spouses shown beside it
    /** Members shown only as a spouse chip inside their partner's unit. */
    absorbedInto: Map<string, string>;
    roots: string[];
}

const byOrder = (people: Map<string, FamilyPerson>) => (a: string, b: string) => {
    const pa = people.get(a)!;
    const pb = people.get(b)!;
    const oa = pa.siblingOrder ?? Number.MAX_SAFE_INTEGER;
    const ob = pb.siblingOrder ?? Number.MAX_SAFE_INTEGER;
    if (oa !== ob) return oa - ob;
    const ya = pa.birthYear ?? Number.MAX_SAFE_INTEGER;
    const yb = pb.birthYear ?? Number.MAX_SAFE_INTEGER;
    if (ya !== yb) return ya - yb;
    return (pa.serialNumber ?? "").localeCompare(pb.serialNumber ?? "") || pa.label.localeCompare(pb.label, "ar");
};

export function buildFamily(peopleList: FamilyPerson[], links: FamilyLink[], marriages: FamilyMarriage[]): FamilyGraph {
    const people = new Map(peopleList.map((p) => [p.id, p]));
    const validLinks = links.filter((l) => people.has(l.source) && people.has(l.target));
    const parentsOf = new Map<string, string[]>();
    for (const l of validLinks) parentsOf.set(l.target, [...(parentsOf.get(l.target) ?? []), l.source]);

    // Pairs, deduplicated, with each side's partner.
    const partners = new Map<string, { marriageId: string; other: string | null; name: string | null }[]>();
    const seen = new Set<string>();
    for (const m of marriages) {
        if (!people.has(m.memberId)) continue;
        const other = m.spouseId && people.has(m.spouseId) ? m.spouseId : null;
        const key = other ? [m.memberId, other].sort().join("|") : `${m.memberId}|${m.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        partners.set(m.memberId, [...(partners.get(m.memberId) ?? []), { marriageId: m.id, other, name: m.spouseName }]);
        if (other) partners.set(other, [...(partners.get(other) ?? []), { marriageId: m.id, other: m.memberId, name: null }]);
    }

    // A member with no parents in the tree who is married to someone in it is drawn
    // only beside that partner. When both have no parents, the wife joins the husband.
    const absorbedInto = new Map<string, string>();
    for (const [id, list] of partners) {
        if (parentsOf.has(id)) continue;
        const host = list.find((p) => p.other && (parentsOf.has(p.other) || (people.get(p.other)!.gender === "male" && people.get(id)!.gender === "female")));
        if (host?.other && !absorbedInto.has(host.other)) absorbedInto.set(id, host.other);
    }
    const unitOf = (id: string) => absorbedInto.get(id) ?? id;

    // Each child hangs from one unit: a non-absorbed parent, preferring the father.
    const primaryParent = new Map<string, string>();
    for (const [child, parents] of parentsOf) {
        if (absorbedInto.has(child)) continue;
        const sorted = [...parents].sort((a, b) => {
            const absorbed = Number(absorbedInto.has(a)) - Number(absorbedInto.has(b));
            if (absorbed) return absorbed;
            return Number(people.get(a)!.gender !== "male") - Number(people.get(b)!.gender !== "male");
        });
        const parentUnit = unitOf(sorted[0]);
        if (parentUnit !== child) primaryParent.set(child, parentUnit);
    }
    // Guard against cycles in bad data: drop a link that would make a unit its own ancestor.
    for (const child of [...primaryParent.keys()]) {
        const visited = new Set([child]);
        let cur = primaryParent.get(child);
        while (cur) {
            if (visited.has(cur)) {
                primaryParent.delete(child);
                break;
            }
            visited.add(cur);
            cur = primaryParent.get(cur);
        }
    }

    const childrenOf = new Map<string, string[]>();
    for (const [child, parent] of primaryParent) childrenOf.set(parent, [...(childrenOf.get(parent) ?? []), child]);
    const order = byOrder(people);
    for (const list of childrenOf.values()) list.sort(order);

    const spousesOf = new Map<string, SpouseRef[]>();
    for (const [id, list] of partners) {
        if (absorbedInto.has(id)) continue;
        spousesOf.set(
            id,
            list.map((p) => {
                const member = p.other ? people.get(p.other) : undefined;
                return {
                    marriageId: p.marriageId,
                    memberId: p.other,
                    name: member?.label ?? p.name ?? "",
                    gender: member?.gender ?? null,
                    photo: member?.photo,
                    elsewhere: Boolean(p.other && !absorbedInto.has(p.other)),
                };
            }),
        );
    }

    const roots = peopleList
        .map((p) => p.id)
        .filter((id) => !absorbedInto.has(id) && !primaryParent.has(id))
        .sort(order);

    return { people, links: validLinks, childrenOf, parentsOf, primaryParent, spousesOf, absorbedInto, roots };
}

/** The unit a person is drawn in (themself, or the partner they are shown beside). */
export const unitIdOf = (g: FamilyGraph, id: string) => g.absorbedInto.get(id) ?? id;

/** "أحمد بن عبدالله بن محمد" following the primary parent line. */
export function lineageName(g: FamilyGraph, id: string, max = 6): string {
    const person = g.people.get(id);
    if (!person) return "";
    const parts = [person.label];
    let cur = g.primaryParent.get(id);
    let first = true;
    while (cur && parts.length < max) {
        const p = g.people.get(cur);
        if (!p) break;
        parts.push(`${first && person.gender === "female" ? "بنت" : "بن"} ${p.label}`);
        first = false;
        cur = g.primaryParent.get(cur);
    }
    return parts.join(" ");
}

export function descendantsOf(g: FamilyGraph, id: string): Set<string> {
    const out = new Set<string>();
    const stack = [...(g.childrenOf.get(id) ?? [])];
    while (stack.length) {
        const c = stack.pop()!;
        if (out.has(c)) continue;
        out.add(c);
        stack.push(...(g.childrenOf.get(c) ?? []));
    }
    return out;
}

export function ancestorsOf(g: FamilyGraph, id: string): string[] {
    const out: string[] = [];
    let cur = g.primaryParent.get(unitIdOf(g, id));
    while (cur && !out.includes(cur)) {
        out.push(cur);
        cur = g.primaryParent.get(cur);
    }
    return out;
}

/** A person's direct family: ancestors, siblings, and all their descendants. */
export function directFamilyOf(g: FamilyGraph, id: string): Set<string> {
    const unit = unitIdOf(g, id);
    const out = new Set<string>([unit, ...ancestorsOf(g, unit), ...descendantsOf(g, unit)]);
    const parent = g.primaryParent.get(unit);
    for (const s of parent ? (g.childrenOf.get(parent) ?? []) : []) out.add(s);
    return out;
}

/** Shortest line between two people through parent-child links (units and link ids). */
export function pathBetween(g: FamilyGraph, a: string, b: string): { units: string[]; links: string[] } | null {
    const neighbours = new Map<string, { to: string; link: string }[]>();
    const add = (x: string, y: string, link: string) => neighbours.set(x, [...(neighbours.get(x) ?? []), { to: y, link }]);
    for (const l of g.links) {
        add(l.source, l.target, l.id);
        add(l.target, l.source, l.id);
    }
    const prev = new Map<string, { from: string; link: string }>();
    const queue = [a];
    const visited = new Set([a]);
    while (queue.length) {
        const cur = queue.shift()!;
        if (cur === b) break;
        for (const n of neighbours.get(cur) ?? []) {
            if (visited.has(n.to)) continue;
            visited.add(n.to);
            prev.set(n.to, { from: cur, link: n.link });
            queue.push(n.to);
        }
    }
    if (!visited.has(b)) return null;
    const people = [b];
    const linkIds: string[] = [];
    for (let cur = b; cur !== a; ) {
        const p = prev.get(cur)!;
        linkIds.push(p.link);
        people.push(p.from);
        cur = p.from;
    }
    return { units: [...new Set(people.map((id) => unitIdOf(g, id)))], links: linkIds };
}

// ---------- Layout ----------

export type Orientation = "vertical" | "horizontal";

export const CARD_W = 190;
export const CARD_H = 92;
export const CHIP_W = 132;
export const CHIP_H = 40;
export const CHIP_GAP = 8;
const SIBLING_GAP = 28;
const ROOT_GAP = 70;
const ROW_GAP = 100;
const COL_GAP = 110;

export interface LaidUnit {
    id: string;
    x: number; // top-left
    y: number;
    width: number;
    height: number;
    depth: number;
    spouses: SpouseRef[];
    childCount: number;
    collapsed: boolean;
}

export interface LaidEdge {
    id: string;
    source: string;
    target: string;
    kind: "primary" | "secondary";
}

export interface Band {
    depth: number;
    label: string;
    start: number; // along the depth axis (y when vertical, x when horizontal)
    end: number;
}

export interface FamilyLayout {
    units: LaidUnit[];
    edges: LaidEdge[];
    bands: Band[];
    bounds: { minX: number; minY: number; maxX: number; maxY: number };
    orientation: Orientation;
}

const ORDINALS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];

export function unitSize(spouseCount: number, orientation: Orientation) {
    return orientation === "vertical"
        ? { width: CARD_W + spouseCount * (CHIP_W + CHIP_GAP), height: CARD_H }
        : { width: CARD_W, height: CARD_H + spouseCount * (CHIP_H + CHIP_GAP) };
}

/**
 * Positions every visible unit. collapsed hides a unit's descendants; include limits
 * the tree to a set of units (e.g. one person's direct family).
 */
export function layoutFamily(
    g: FamilyGraph,
    { orientation = "vertical", collapsed = new Set<string>(), include }: { orientation?: Orientation; collapsed?: Set<string>; include?: Set<string> } = {},
): FamilyLayout {
    const vertical = orientation === "vertical";
    const visible = (id: string) => !include || include.has(id);
    const kids = (id: string) => (collapsed.has(id) ? [] : (g.childrenOf.get(id) ?? []).filter(visible));
    const size = (id: string) => unitSize(g.spousesOf.get(id)?.length ?? 0, orientation);
    const breadthOf = (id: string) => (vertical ? size(id).width : size(id).height);

    const span = new Map<string, number>();
    const measure = (id: string): number => {
        const children = kids(id);
        const childSpan = children.reduce((t, c) => t + measure(c), 0) + Math.max(0, children.length - 1) * SIBLING_GAP;
        const s = Math.max(breadthOf(id), childSpan);
        span.set(id, s);
        return s;
    };

    const centre = new Map<string, number>();
    const depthOf = new Map<string, number>();
    // Vertical: right-to-left, so the first (eldest) child takes the right end.
    const place = (id: string, start: number, depth: number) => {
        depthOf.set(id, depth);
        const children = kids(id);
        const total = span.get(id)!;
        const childSpan = children.reduce((t, c) => t + span.get(c)!, 0) + Math.max(0, children.length - 1) * SIBLING_GAP;
        let cursor = vertical ? start + (total + childSpan) / 2 : start + (total - childSpan) / 2;
        for (const c of children) {
            const s = span.get(c)!;
            if (vertical) {
                place(c, cursor - s, depth + 1);
                cursor -= s + SIBLING_GAP;
            } else {
                place(c, cursor, depth + 1);
                cursor += s + SIBLING_GAP;
            }
        }
        centre.set(
            id,
            children.length ? (centre.get(children[0])! + centre.get(children[children.length - 1])!) / 2 : start + total / 2,
        );
    };

    const roots = include ? [...include].filter((id) => !g.primaryParent.has(id) || !include.has(g.primaryParent.get(id)!)) : g.roots;
    const orderedRoots = roots.filter((id) => g.people.has(id) && !g.absorbedInto.has(id)).sort(byOrder(g.people));
    let cursor = 0;
    for (const r of orderedRoots) {
        const s = measure(r);
        if (vertical) {
            place(r, cursor - s, 0);
            cursor -= s + ROOT_GAP;
        } else {
            place(r, cursor, 0);
            cursor += s + ROOT_GAP;
        }
    }

    const rowStep = vertical ? CARD_H + ROW_GAP : CARD_W + COL_GAP;
    const units: LaidUnit[] = [];
    for (const [id, c] of centre) {
        const { width, height } = size(id);
        const depth = depthOf.get(id)!;
        units.push({
            id,
            depth,
            width,
            height,
            x: vertical ? c - width / 2 : -depth * rowStep - width,
            y: vertical ? depth * rowStep : c - height / 2,
            spouses: g.spousesOf.get(id) ?? [],
            childCount: (g.childrenOf.get(id) ?? []).filter(visible).length,
            collapsed: collapsed.has(id),
        });
    }

    const shown = new Set(units.map((u) => u.id));
    const edges: LaidEdge[] = [];
    const drawn = new Set<string>();
    for (const l of g.links) {
        const child = l.target;
        const parentUnit = unitIdOf(g, l.source);
        if (!shown.has(child) || !shown.has(parentUnit) || parentUnit === child) continue;
        // Father and mother drawn as one couple give one line, not two.
        const key = `${parentUnit}|${child}`;
        if (drawn.has(key)) continue;
        drawn.add(key);
        edges.push({ id: l.id, source: parentUnit, target: child, kind: g.primaryParent.get(child) === parentUnit ? "primary" : "secondary" });
    }

    const xs = units.flatMap((u) => [u.x, u.x + u.width]);
    const ys = units.flatMap((u) => [u.y, u.y + u.height]);
    const bounds = units.length
        ? { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) }
        : { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const depths = [...new Set(units.map((u) => u.depth))].sort((a, b) => a - b);
    const bands: Band[] = depths.map((d) => {
        const atDepth = units.filter((u) => u.depth === d);
        const counts = new Map<string, number>();
        for (const u of atDepth) {
            const role = g.people.get(u.id)?.role?.trim();
            if (role) counts.set(role, (counts.get(role) ?? 0) + 1);
        }
        const common = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
        const start = vertical ? d * rowStep - ROW_GAP / 2 : -(d + 1) * rowStep + COL_GAP / 2;
        return { depth: d, label: common ?? `الجيل ${ORDINALS[d] ?? d + 1}`, start, end: start + rowStep };
    });

    return { units, edges, bands, bounds, orientation };
}

/** Units to fold by default so a large tree opens readable: deeper than maxDepth. */
export function defaultCollapsed(g: FamilyGraph, maxDepth = 3, threshold = 80): Set<string> {
    if (g.people.size <= threshold) return new Set();
    const out = new Set<string>();
    const walk = (id: string, depth: number) => {
        if (depth >= maxDepth && (g.childrenOf.get(id)?.length ?? 0) > 0) {
            out.add(id);
            return;
        }
        for (const c of g.childrenOf.get(id) ?? []) walk(c, depth + 1);
    };
    for (const r of g.roots) walk(r, 0);
    return out;
}

/** A stable colour per branch name, for the card stripe. */
export function branchColor(branch?: string): string {
    if (!branch) return "#D4AF37";
    const palette = ["#D4AF37", "#0f766e", "#7c3aed", "#b45309", "#be123c", "#1d4ed8", "#15803d", "#a21caf"];
    let h = 0;
    for (const ch of branch) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return palette[h % palette.length];
}

/** "1340 – 1410 هـ", "1405 هـ", or "" when unknown. */
export function lifeYears(p: FamilyPerson): string {
    const suffix = p.yearSuffix ?? "هـ";
    if (p.birthYear && p.deathYear) return `${p.birthYear} – ${p.deathYear} ${suffix}`;
    if (p.birthYear) return `${p.birthYear} ${suffix}`;
    if (p.deathYear) return `ت ${p.deathYear} ${suffix}`;
    return "";
}

/**
 * Highlight data for a path given as a list of people (e.g. from the kinship tool):
 * the units they are drawn in, and the parent-child links between consecutive people.
 */
export function pathFromPeople(g: FamilyGraph, ids: string[]): { units: string[]; links: string[] } {
    const links: string[] = [];
    for (let i = 0; i + 1 < ids.length; i++) {
        const [a, b] = [ids[i], ids[i + 1]];
        const link = g.links.find((l) => (l.source === a && l.target === b) || (l.source === b && l.target === a));
        if (link) links.push(link.id);
    }
    return { units: [...new Set(ids.map((id) => unitIdOf(g, id)))], links };
}
