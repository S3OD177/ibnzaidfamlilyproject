import type { TreeNodeData, TreeViewNodeData } from "@/lib/data/tree";
import type { FamilyPerson } from "./family";

// Converters from the two tree data shapes to the family layout's FamilyPerson.

/** Editor data as the family layout expects it. */
export function toFamilyPeople(nodes: { id: string; data: TreeNodeData }[]): FamilyPerson[] {
    return nodes.map(({ id, data }) => ({
        id,
        label: data.label,
        gender: data.gender,
        status: data.status,
        photo: data.photo,
        serialNumber: data.serialNumber,
        role: data.role,
        branch: data.branch,
        siblingOrder: data.siblingOrder ? Number(data.siblingOrder) : null,
        birthYear: data.birthDate?.year ? Number(data.birthDate.year) : null,
        deathYear: data.status === "deceased" && data.deathDate?.year ? Number(data.deathDate.year) : null,
        yearSuffix: (data.birthDate?.type ?? data.deathDate?.type) === "Gregorian" ? ("م" as const) : ("هـ" as const),
    }));
}

/** Members' view data (already filtered for privacy) as FamilyPerson. */
export function viewToFamilyPeople(nodes: { id: string; data: TreeViewNodeData }[]): FamilyPerson[] {
    return nodes.map(({ id, data }) => ({ id, ...data }));
}
