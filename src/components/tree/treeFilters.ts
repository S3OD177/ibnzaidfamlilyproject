import { unitIdOf, type FamilyGraph, type FamilyPerson } from "@/lib/tree/family";

// Filters for the members' tree. Each returns a set of unit ids for layoutFamily's
// `include`, always closed under ancestors so the drawn line stays connected.

/** Distinct branch names in use, in Arabic order. */
export function branchesOf(g: FamilyGraph): string[] {
    const out = new Set<string>();
    for (const p of g.people.values()) {
        const b = p.branch?.trim();
        if (b) out.add(b);
    }
    return [...out].sort((a, b) => a.localeCompare(b, "ar"));
}

function withAncestors(g: FamilyGraph, units: Iterable<string>): Set<string> {
    const out = new Set<string>();
    for (const u of units) {
        let cur: string | undefined = u;
        while (cur && !out.has(cur)) {
            out.add(cur);
            cur = g.primaryParent.get(cur);
        }
    }
    return out;
}

/** Everyone in a branch (as units) plus their ancestors. */
export function branchInclude(g: FamilyGraph, branch: string): Set<string> {
    const units: string[] = [];
    for (const p of g.people.values()) if (p.branch?.trim() === branch) units.push(unitIdOf(g, p.id));
    return withAncestors(g, units);
}

/** Units that are not deceased, or have a living (not deceased) descendant. */
export function livingInclude(g: FamilyGraph): Set<string> {
    const keep = new Map<string, boolean>();
    const visit = (id: string): boolean => {
        const known = keep.get(id);
        if (known !== undefined) return known;
        keep.set(id, false); // cycle guard
        let any = g.people.get(id)?.status !== "deceased";
        for (const c of g.childrenOf.get(id) ?? []) if (visit(c)) any = true;
        keep.set(id, any);
        return any;
    };
    for (const id of g.people.keys()) if (!g.absorbedInto.has(id)) visit(id);
    return new Set([...keep].filter(([, k]) => k).map(([id]) => id));
}

/** Intersection of the given include sets (undefined entries mean "no limit"). */
export function intersectIncludes(...sets: (Set<string> | undefined)[]): Set<string> | undefined {
    const active = sets.filter((s): s is Set<string> => Boolean(s));
    if (!active.length) return undefined;
    const [first, ...rest] = active.sort((a, b) => a.size - b.size);
    return new Set([...first].filter((id) => rest.every((s) => s.has(id))));
}

/** People whose name contains the query, or whose serial number equals it. */
export function searchPeople(g: FamilyGraph, query: string): FamilyPerson[] {
    const q = query.trim();
    if (q.length < 2) return [];
    return [...g.people.values()].filter((p) => p.label.includes(q) || p.serialNumber === q);
}

/** Same ordering as the tree: sibling order, then birth year, serial and name. */
export function compareByOrder(g: FamilyGraph) {
    return (a: string, b: string) => {
        const pa = g.people.get(a)!;
        const pb = g.people.get(b)!;
        const oa = pa.siblingOrder ?? Number.MAX_SAFE_INTEGER;
        const ob = pb.siblingOrder ?? Number.MAX_SAFE_INTEGER;
        if (oa !== ob) return oa - ob;
        const ya = pa.birthYear ?? Number.MAX_SAFE_INTEGER;
        const yb = pb.birthYear ?? Number.MAX_SAFE_INTEGER;
        if (ya !== yb) return ya - yb;
        return (pa.serialNumber ?? "").localeCompare(pb.serialNumber ?? "") || pa.label.localeCompare(pb.label, "ar");
    };
}
