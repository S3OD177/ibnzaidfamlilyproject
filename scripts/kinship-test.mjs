// Checks the Arabic kinship names in src/lib/tree/kinship.ts on a small sample family.
// Run: node scripts/kinship-test.mjs   (Node 22.6+ strips the module's TypeScript types)
import assert from "node:assert/strict";
import { kinship, kinshipGraph, ancestorsBothSides } from "../src/lib/tree/kinship.ts";

const people = [];
const links = [];
const marriages = [];
const P = (id, gender, ...parents) => {
    people.push({ id, label: id, gender });
    for (const p of parents) links.push({ source: p, target: id });
};
const marry = (a, b) => marriages.push({ memberId: a, spouseId: b });

// Father's side
P("GGGF", "male");
P("GGF", "male", "GGGF");
P("X", "male", "GGGF"); // brother of GGF
P("X1", "male", "X");
P("X2", "male", "X1");
P("X3", "female", "X2");
P("GF", "male", "GGF");
P("GGU", "male", "GGF"); // brother of GF
P("GGUS", "male", "GGU");
P("GGUSS", "male", "GGUS");
P("GM", "female");
marry("GF", "GM");
P("F", "male", "GF", "GM");
P("U", "male", "GF", "GM");
P("AU", "female", "GF", "GM");
P("UC", "male", "U");
P("UD", "female", "U");
P("AUS", "male", "AU");
P("AUD", "female", "AU");
// Mother's side
P("MGGF", "male");
P("MGF", "male", "MGGF");
P("MGU", "male", "MGGF"); // brother of MGF
P("MGM", "female");
marry("MGF", "MGM");
P("M", "female", "MGF", "MGM");
P("MU", "male", "MGF", "MGM");
P("MA", "female", "MGF", "MGM");
P("MUC", "male", "MU");
P("MUD", "female", "MU");
P("MAC", "male", "MA");
P("MAD", "female", "MA");
// Parents and siblings
marry("F", "M");
P("W2", "female");
marry("F", "W2");
P("H0", "male");
marry("H0", "M");
P("Me", "male", "F", "M");
P("Sis", "female", "F", "M");
P("HB", "male", "F", "W2"); // half-brother through the father
P("HS", "female", "H0", "M"); // half-sister through the mother
P("SisH", "male");
marry("SisH", "Sis");
P("SisSon", "male", "Sis", "SisH");
P("BroSon", "male", "HB");
P("BroSonSon", "male", "BroSon");
// Wife and descendants
P("WF", "male");
P("WM", "female");
P("Wife", "female", "WF", "WM");
P("WB", "male", "WF", "WM");
marry("Me", "Wife");
P("Son", "male", "Me", "Wife");
P("Dau", "female", "Me", "Wife");
P("SonWife", "female");
marry("Son", "SonWife");
P("DauH", "male");
marry("DauH", "Dau");
P("GS", "male", "Son", "SonWife");
P("GD", "female", "Dau", "DauH");
P("GGS", "male", "GS");
P("GGGS", "female", "GGS");
P("Stranger", "male");

const g = kinshipGraph(people, links, marriages);
const label = (a, b) => kinship(g, a, b)?.label ?? null;

const cases = [
    ["Me", "Me", "نفس الشخص"],
    ["F", "Me", "أب"],
    ["M", "Me", "أم"],
    ["Me", "F", "ابن"],
    ["Sis", "F", "ابنة"],
    ["Sis", "Me", "أخت شقيقة"],
    ["Me", "Sis", "أخ شقيق"],
    ["HB", "Me", "أخ لأب"],
    ["HS", "Me", "أخت لأم"],
    ["GF", "Me", "جد لأب"],
    ["GM", "Me", "جدة لأب"],
    ["MGF", "Me", "جد لأم"],
    ["MGM", "Me", "جدة لأم"],
    ["GGF", "Me", "جد الأب"],
    ["MGGF", "Me", "جد الأم"],
    ["GGGF", "Me", "الجد الثالث من جهة الأب"],
    ["GS", "Me", "حفيد"],
    ["GD", "Me", "حفيدة"],
    ["GGS", "Me", "حفيد الابن"],
    ["GGGS", "Me", "الحفيدة الثالثة"],
    ["U", "Me", "عم"],
    ["AU", "Me", "عمة"],
    ["MU", "Me", "خال"],
    ["MA", "Me", "خالة"],
    ["UC", "Me", "ابن عم"],
    ["UD", "Me", "ابنة عم"],
    ["AUS", "Me", "ابن عمة"],
    ["AUD", "Me", "ابنة عمة"],
    ["MUC", "Me", "ابن خال"],
    ["MUD", "Me", "ابنة خال"],
    ["MAC", "Me", "ابن خالة"],
    ["MAD", "Me", "ابنة خالة"],
    ["SisSon", "Me", "ابن أخت"],
    ["BroSon", "Me", "ابن أخ"],
    ["BroSonSon", "Me", "حفيد الأخ"],
    ["Me", "SisSon", "خال"],
    ["GGU", "Me", "عم الأب"],
    ["MGU", "Me", "عم الأم"],
    ["GGUS", "Me", "ابن عم الأب"],
    ["GGUSS", "Me", "ابن ابن عم الأب"],
    ["X", "Me", "عم الجد"],
    ["X1", "Me", "ابن عم الجد"],
    ["X3", "Me", "قريبة من الدرجة 8 (الجد المشترك: GGGF)"],
    // By marriage
    ["Wife", "Me", "زوجة"],
    ["Me", "Wife", "زوج"],
    ["WF", "Me", "والد الزوجة (حمو)"],
    ["WM", "Me", "والدة الزوجة (حماة)"],
    ["MGF", "F", "والد الزوجة (حمو)"],
    ["GM", "M", "والدة الزوج (حماة)"],
    ["DauH", "Me", "زوج الابنة (صهر)"],
    ["SonWife", "Me", "زوجة الابن (كنّة)"],
    ["WB", "Me", "أخو الزوجة"],
    ["SisH", "Me", "زوج الأخت"],
    ["W2", "Me", "زوجة الأب"],
    ["H0", "Sis", "زوج الأم"],
    ["Stranger", "Me", null],
];

let failed = 0;
for (const [a, b, expected] of cases) {
    const got = label(a, b);
    const ok = got === expected;
    if (!ok) failed++;
    console.log(`${ok ? "ok  " : "FAIL"} ${a} → ${b}: ${got}${ok ? "" : `   (expected ${expected})`}`);
}

// Paths, common ancestor and the mother's-side flag.
const cousin = kinship(g, "MUC", "Me");
assert.deepEqual(cousin.path, ["MUC", "MU", "MGF", "M", "Me"]);
assert.equal(cousin.commonAncestor, "MGF");
assert.equal(cousin.viaMother, true);
const paternal = kinship(g, "UC", "Me");
assert.deepEqual(paternal.path, ["UC", "U", "GF", "F", "Me"]);
assert.equal(paternal.viaMother, false);
assert.equal(kinship(g, "Sis", "Me").commonAncestor, "F");
assert.equal(kinship(g, "HS", "Me").commonAncestor, "M");
assert.equal(kinship(g, "HS", "Me").viaMother, true);

// Pedigree slots: 1 Me, 2 F, 3 M, 4 GF, 5 GM, 6 MGF, 7 MGM, 8 GGF, 12 MGGF …
const slots = ancestorsBothSides(g, "Me", 3);
assert.equal(slots.length, 15);
const at = (n) => slots.find((s) => s.n === n);
assert.deepEqual(
    [1, 2, 3, 4, 5, 6, 7, 8, 12].map((n) => at(n).id),
    ["Me", "F", "M", "GF", "GM", "MGF", "MGM", "GGF", "MGGF"],
);
assert.equal(at(9).id, null);
assert.equal(at(5).line, "paternal");
assert.equal(at(6).line, "maternal");
assert.equal(at(7).role, "mother");

if (failed) {
    console.error(`\n${failed} label(s) failed`);
    process.exit(1);
}
console.log(`\nAll ${cases.length} labels and path checks passed.`);
