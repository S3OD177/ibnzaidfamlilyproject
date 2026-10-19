// Arabic kinship names between two people in the family tree. Pure functions, no React.
// Blood relations are found through ANY parent (fathers and mothers) by climbing both
// people's ancestors and taking the closest common one; relations by marriage use the
// spouse list. Only type imports here so the module also runs under plain Node (tests).

import type { FamilyPerson, SpouseRef } from "./family";

type Gender = "male" | "female";

/** The parts of FamilyGraph this module needs; a FamilyGraph from buildFamily fits. */
export interface KinshipGraph {
    people: Map<string, Pick<FamilyPerson, "id" | "label" | "gender">>;
    /** child -> all parents in the tree (fathers and mothers). */
    parentsOf: Map<string, string[]>;
    /** Optional: person -> spouses (one or both directions; the index is made symmetric). */
    spousesOf?: Map<string, Pick<SpouseRef, "memberId">[]>;
}

export interface Kinship {
    /** "A is B's ___", e.g. "ابن عم", "خالة", "زوجة الابن (كنّة)". */
    label: string;
    kind: "self" | "blood" | "marriage";
    /** Ids from A to B. For blood relations it runs A → … → common ancestor → … → B. */
    path: string[];
    commonAncestor: string | null;
    /** Some step on the path goes through a mother (or a female ancestor). */
    viaMother: boolean;
    /** Generations from the common ancestor down to A and to B (0 for marriage relations). */
    distanceA: number;
    distanceB: number;
}

/** Builds the minimal graph from plain records (e.g. React Flow nodes/edges and marriages). */
export function kinshipGraph(
    people: { id: string; label: string; gender: Gender }[],
    links: { source: string; target: string }[],
    marriages: { memberId: string; spouseId: string | null }[] = [],
): KinshipGraph {
    const map = new Map(people.map((p) => [p.id, { id: p.id, label: p.label, gender: p.gender }]));
    const parentsOf = new Map<string, string[]>();
    for (const l of links) {
        if (!map.has(l.source) || !map.has(l.target) || l.source === l.target) continue;
        const list = parentsOf.get(l.target) ?? [];
        if (!list.includes(l.source)) parentsOf.set(l.target, [...list, l.source]);
    }
    const spousesOf = new Map<string, { memberId: string | null }[]>();
    for (const m of marriages) {
        if (!m.spouseId || !map.has(m.memberId) || !map.has(m.spouseId)) continue;
        spousesOf.set(m.memberId, [...(spousesOf.get(m.memberId) ?? []), { memberId: m.spouseId }]);
    }
    return { people: map, parentsOf, spousesOf };
}

// ---------- Indexes (cached per graph) ----------

interface Index {
    children: Map<string, string[]>;
    spouses: Map<string, Set<string>>;
}
const indexes = new WeakMap<KinshipGraph, Index>();

function indexOf(g: KinshipGraph): Index {
    let idx = indexes.get(g);
    if (idx) return idx;
    const children = new Map<string, string[]>();
    for (const [child, parents] of g.parentsOf) for (const p of parents) children.set(p, [...(children.get(p) ?? []), child]);
    const spouses = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
        if (a === b) return;
        if (!spouses.has(a)) spouses.set(a, new Set());
        spouses.get(a)!.add(b);
    };
    for (const [id, list] of g.spousesOf ?? []) {
        for (const s of list) {
            if (!s.memberId) continue;
            add(id, s.memberId);
            add(s.memberId, id);
        }
    }
    idx = { children, spouses };
    indexes.set(g, idx);
    return idx;
}

const genderOf = (g: KinshipGraph, id: string): Gender => g.people.get(id)?.gender ?? "male";
const isMale = (g: KinshipGraph, id: string) => genderOf(g, id) === "male";

/** Parents with fathers first, so ties resolve along the father's line. */
function parents(g: KinshipGraph, id: string): string[] {
    return [...(g.parentsOf.get(id) ?? [])].filter((p) => g.people.has(p)).sort((a, b) => Number(!isMale(g, a)) - Number(!isMale(g, b)));
}

function fatherOf(g: KinshipGraph, id: string) {
    return parents(g, id).find((p) => isMale(g, p)) ?? null;
}
function motherOf(g: KinshipGraph, id: string) {
    return parents(g, id).find((p) => !isMale(g, p)) ?? null;
}

/** Every ancestor (and the person) with the generation distance and the child it was reached through. */
function climb(g: KinshipGraph, id: string): Map<string, { dist: number; down: string | null }> {
    const out = new Map<string, { dist: number; down: string | null }>([[id, { dist: 0, down: null }]]);
    const queue = [id];
    while (queue.length) {
        const cur = queue.shift()!;
        const d = out.get(cur)!.dist;
        for (const p of parents(g, cur)) {
            if (out.has(p)) continue;
            out.set(p, { dist: d + 1, down: cur });
            queue.push(p);
        }
    }
    return out;
}

/** [ancestor, …, person] following the "down" pointers. */
function chainFrom(up: Map<string, { dist: number; down: string | null }>, ancestor: string): string[] {
    const chain = [ancestor];
    let cur = up.get(ancestor)?.down ?? null;
    while (cur) {
        chain.push(cur);
        cur = up.get(cur)?.down ?? null;
    }
    return chain;
}

// ---------- Words ----------

const ORD_M = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];
const ORD_F = ["الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة", "الثامنة", "التاسعة", "العاشرة"];
const ord = (n: number, male: boolean) => (male ? ORD_M : ORD_F)[n - 1] ?? `رقم ${n}`;

const theParent = (male: boolean) => (male ? "الأب" : "الأم");
/** A's word as the sibling of X: عم/عمة when X is a man, خال/خالة when X is a woman. */
const uncleWord = (aMale: boolean, xMale: boolean) => (xMale ? (aMale ? "عم" : "عمة") : aMale ? "خال" : "خالة");

/**
 * Name of A relative to B given the chains from their common ancestor:
 * chainA = [lca, …, A], chainB = [lca, …, B]. Returns null when no precise name fits.
 */
function bloodName(g: KinshipGraph, aMale: boolean, chainA: string[], chainB: string[]): string | null {
    const dA = chainA.length - 1;
    const dB = chainB.length - 1;
    const male = (id: string) => isMale(g, id);
    const B = chainB[dB];
    const A = chainA[dA];

    if (dA === 0 && dB === 0) return "نفس الشخص";

    // A is an ancestor of B.
    if (dA === 0) {
        const bParent = chainB[dB - 1]; // B's parent on the line
        if (dB === 1) return aMale ? "أب" : "أم";
        if (dB === 2) return `${aMale ? "جد" : "جدة"} ${male(bParent) ? "لأب" : "لأم"}`;
        if (dB === 3) return `${aMale ? "جد" : "جدة"} ${theParent(male(bParent))}`;
        return `${aMale ? "الجد" : "الجدة"} ${ord(dB - 1, aMale)} من جهة ${theParent(male(bParent))}`;
    }

    // A is a descendant of B.
    if (dB === 0) {
        const bChild = chainA[1]; // B's child on the line
        if (dA === 1) return aMale ? "ابن" : "ابنة";
        if (dA === 2) return aMale ? "حفيد" : "حفيدة";
        if (dA === 3) return `${aMale ? "حفيد" : "حفيدة"} ${male(bChild) ? "الابن" : "الابنة"}`;
        return `${aMale ? "الحفيد" : "الحفيدة"} ${ord(dA - 1, aMale)}`;
    }

    // Siblings.
    if (dA === 1 && dB === 1) {
        const base = aMale ? "أخ" : "أخت";
        const fa = fatherOf(g, A);
        const fb = fatherOf(g, B);
        const ma = motherOf(g, A);
        const mb = motherOf(g, B);
        const sameF = Boolean(fa && fa === fb);
        const sameM = Boolean(ma && ma === mb);
        if (sameF && sameM) return `${base} ${aMale ? "شقيق" : "شقيقة"}`;
        if (sameF && ma && mb) return `${base} لأب`;
        if (sameM && fa && fb) return `${base} لأم`;
        return base;
    }

    // A is a sibling of one of B's ancestors: عم، خال، عم الأب، خال الأم، عم الجد…
    if (dA === 1) {
        const x = chainB[1]; // B's ancestor that A is a sibling of
        const word = uncleWord(aMale, male(x));
        if (dB === 2) return word;
        if (dB === 3) return `${word} ${theParent(male(chainB[2]))}`;
        if (dB === 4) return `${word} ${male(chainB[2]) ? "الجد" : "الجدة"}`;
        return null;
    }

    // A descends from B's sibling: ابن أخ، ابنة أخت، حفيد الأخ…
    if (dB === 1) {
        const s = chainA[1]; // B's sibling
        if (dA === 2) return `${aMale ? "ابن" : "ابنة"} ${male(s) ? "أخ" : "أخت"}`;
        if (dA === 3) return `${aMale ? "حفيد" : "حفيدة"} ${male(s) ? "الأخ" : "الأخت"}`;
        return null;
    }

    // Cousins and beyond: A is the child of someone whose name we already know.
    if (dA > 3) return null;
    const parent = chainA[dA - 1];
    const inner = bloodName(g, male(parent), chainA.slice(0, -1), chainB);
    return inner ? `${aMale ? "ابن" : "ابنة"} ${inner}` : null;
}

function hasMotherStep(g: KinshipGraph, path: string[]): boolean {
    for (let i = 0; i + 1 < path.length; i++) {
        const [x, y] = [path[i], path[i + 1]];
        const parent = g.parentsOf.get(y)?.includes(x) ? x : g.parentsOf.get(x)?.includes(y) ? y : null;
        if (parent && !isMale(g, parent)) return true;
    }
    return false;
}

/** Closest blood relation through any parents, or null when there is no common ancestor. */
export function bloodKinship(g: KinshipGraph, a: string, b: string): Kinship | null {
    if (!g.people.has(a) || !g.people.has(b)) return null;
    if (a === b) return { label: "نفس الشخص", kind: "self", path: [a], commonAncestor: a, viaMother: false, distanceA: 0, distanceB: 0 };
    const upA = climb(g, a);
    const upB = climb(g, b);
    let best: { id: string; sum: number } | null = null;
    for (const [id, { dist }] of upA) {
        const other = upB.get(id);
        if (!other) continue;
        const sum = dist + other.dist;
        if (!best || sum < best.sum || (sum === best.sum && isMale(g, id) && !isMale(g, best.id))) best = { id, sum };
    }
    if (!best) return null;
    const chainA = chainFrom(upA, best.id);
    const chainB = chainFrom(upB, best.id);
    const path = [...[...chainA].reverse(), ...chainB.slice(1)];
    const dA = chainA.length - 1;
    const dB = chainB.length - 1;
    const aMale = isMale(g, a);
    const label =
        bloodName(g, aMale, chainA, chainB) ??
        `${aMale ? "قريب" : "قريبة"} من الدرجة ${dA + dB} (الجد المشترك: ${g.people.get(best.id)?.label ?? ""})`;
    return { label, kind: "blood", path, commonAncestor: best.id, viaMother: hasMotherStep(g, path), distanceA: dA, distanceB: dB };
}

/** Relations by marriage (A relative to B), or null. */
export function marriageKinship(g: KinshipGraph, a: string, b: string): Kinship | null {
    if (!g.people.has(a) || !g.people.has(b) || a === b) return null;
    const { children, spouses } = indexOf(g);
    const spousesOf = (id: string) => [...(spouses.get(id) ?? [])].filter((s) => g.people.has(s));
    const parentsOfId = (id: string) => g.parentsOf.get(id) ?? [];
    const aMale = isMale(g, a);
    const make = (label: string, path: string[]): Kinship => ({
        label,
        kind: "marriage",
        path,
        commonAncestor: null,
        viaMother: hasMotherStep(g, path),
        distanceA: 0,
        distanceB: 0,
    });
    const spouseWord = (id: string) => (isMale(g, id) ? "الزوج" : "الزوجة");

    if (spousesOf(b).includes(a)) return make(aMale ? "زوج" : "زوجة", [a, b]);

    // Parent of B's spouse.
    for (const s of spousesOf(b)) {
        if (parentsOfId(s).includes(a)) return make(`${aMale ? "والد" : "والدة"} ${spouseWord(s)} (${aMale ? "حمو" : "حماة"})`, [a, s, b]);
    }
    // Spouse of B's child.
    for (const c of children.get(b) ?? []) {
        if (spousesOf(c).includes(a)) return make(aMale ? "زوج الابنة (صهر)" : "زوجة الابن (كنّة)", [a, c, b]);
    }
    // Spouse of B's parent (step-parent).
    for (const p of parentsOfId(b)) {
        if (spousesOf(p).includes(a)) return make(aMale ? "زوج الأم" : "زوجة الأب", [a, p, b]);
    }
    // Child of B's spouse (step-child).
    for (const s of spousesOf(b)) {
        if (parentsOfId(a).includes(s)) return make(`${aMale ? "ابن" : "ابنة"} ${spouseWord(s)}`, [a, s, b]);
    }
    // Sibling of B's spouse.
    for (const s of spousesOf(b)) {
        const shared = parentsOfId(a).find((p) => parentsOfId(s).includes(p));
        if (shared) return make(`${aMale ? "أخو" : "أخت"} ${spouseWord(s)}`, [a, shared, s, b]);
    }
    // Spouse of B's sibling.
    for (const s of spousesOf(a)) {
        const shared = parentsOfId(b).find((p) => parentsOfId(s).includes(p));
        if (shared) return make(isMale(g, s) ? (aMale ? "زوج الأخ" : "زوجة الأخ") : aMale ? "زوج الأخت" : "زوجة الأخت", [a, s, shared, b]);
    }
    return null;
}

/**
 * "A is B's ___". A direct marriage wins (spouses who are also cousins read as زوج/زوجة),
 * then the closest blood relation through any parent, then other in-law relations.
 */
export function kinship(g: KinshipGraph, a: string, b: string): Kinship | null {
    if (!g.people.has(a) || !g.people.has(b)) return null;
    if (a !== b && indexOf(g).spouses.get(b)?.has(a)) return marriageKinship(g, a, b);
    return bloodKinship(g, a, b) ?? marriageKinship(g, a, b);
}

// ---------- Pedigree (ancestors on both sides) ----------

export interface PedigreeSlot {
    /** Ahnentafel number: 1 the person, 2n father of n, 2n+1 mother of n. */
    n: number;
    generation: number;
    id: string | null;
    role: "self" | "father" | "mother";
    /** Which of the person's parents this ancestor comes through. */
    line: "self" | "paternal" | "maternal";
}

/** The person and `depth` generations of ancestors through both parents, Ahnentafel ordered. */
export function ancestorsBothSides(g: KinshipGraph, id: string, depth: number): PedigreeSlot[] {
    const total = 2 ** (depth + 1) - 1;
    const ids: (string | null)[] = new Array(total + 1).fill(null);
    ids[1] = g.people.has(id) ? id : null;
    for (let n = 1; 2 * n + 1 <= total; n++) {
        const cur = ids[n];
        if (!cur) continue;
        const ps = parents(g, cur);
        const father = ps.find((p) => isMale(g, p)) ?? null;
        const mother = ps.find((p) => !isMale(g, p)) ?? null;
        const rest = ps.filter((p) => p !== father && p !== mother);
        ids[2 * n] = father ?? rest.shift() ?? null;
        ids[2 * n + 1] = mother ?? rest.shift() ?? null;
    }
    const slots: PedigreeSlot[] = [];
    for (let n = 1; n <= total; n++) {
        const generation = Math.floor(Math.log2(n));
        const line = n === 1 ? "self" : n >> Math.max(0, generation - 1) === 2 ? "paternal" : "maternal";
        slots.push({ n, generation, id: ids[n], role: n === 1 ? "self" : n % 2 === 0 ? "father" : "mother", line });
    }
    return slots;
}
