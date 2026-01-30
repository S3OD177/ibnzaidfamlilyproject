import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import tmp from "tmp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadLayoutCore = async () => {
  const sourcePath = path.join(__dirname, "src/layout-core.ts");
  
  const tmpFile = tmp.fileSync({ postfix: '.mjs' });
  
  await build({
    entryPoints: [sourcePath],
    bundle: true,
    write: true,
    outfile: tmpFile.name,
    format: 'esm'
  });

  const module = await import(tmpFile.name);
  
  tmpFile.removeCallback();
  
  return module;
};

const layoutCore = await loadLayoutCore();
const {
  buildTree,
  layoutTree,
  computeNodeSize,
  gapBetween,
  isLeaf,
  logSiblingGaps,
  MIN_NODE_WIDTH,
  LEAF_SPACING,
  H_SPACING,
  buildScene,
} = layoutCore;

const toggles = {
  showYears: true,
  showDescription: true,
  showGenderColor: true,
};

const people = JSON.parse(
  readFileSync(path.join(__dirname, "family-tree.json"), "utf8"),
);

const sizeMap = new Map(
  people.map((person) => [person.id, computeNodeSize(person, toggles)]),
);
const { nodes, roots } = buildTree(people);
const { positions, widths, layoutWidths } = layoutTree(people, sizeMap);

console.log("--- Node Positions ---");
for (const [id, pos] of positions.entries()) {
  const person = nodes.get(id);
  console.log(`Node ${person.name} (${id}): x=${pos.x.toFixed(2)}, y=${pos.y.toFixed(2)}`);
}
console.log("----------------------");


// Print spacing info so we can eyeball gaps easily.
logSiblingGaps(
  people,
  positions,
  widths,
  sizeMap,
  "layoutTree",
  layoutWidths,
);

const calcGaps = (left, right) => {
  const leftPos = positions.get(left.id);
  const rightPos = positions.get(right.id);
  if (!leftPos || !rightPos)
    return { nodeGap: Number.NaN, subtreeGap: Number.NaN };

  const leftNodeWidth = sizeMap.get(left.id)?.width ?? MIN_NODE_WIDTH;
  const rightNodeWidth = sizeMap.get(right.id)?.width ?? MIN_NODE_WIDTH;
  if (isLeaf(left) || isLeaf(right)) {
    const leafGap = rightPos.x - (leftPos.x + leftNodeWidth);
    return { nodeGap: leafGap, subtreeGap: leafGap };
  }

  const leftSubtreeWidth =
    widths.get(left.id) ?? sizeMap.get(left.id)?.width ?? MIN_NODE_WIDTH;
  const rightSubtreeWidth =
    widths.get(right.id) ?? sizeMap.get(right.id)?.width ?? MIN_NODE_WIDTH;

  const leftCenter = leftPos.x + leftNodeWidth / 2;
  const rightCenter = rightPos.x + rightNodeWidth / 2;

  const subtreeGap =
    rightCenter - rightSubtreeWidth / 2 - (leftCenter + leftSubtreeWidth / 2);
  const nodeGap = rightPos.x - (leftPos.x + leftNodeWidth);

  return { nodeGap, subtreeGap };
};

const assertGap = (parentId, expected, label) => {
  const parent = nodes.get(parentId);
  if (!parent) throw new Error(`Missing parent ${parentId} (${label})`);
  if (parent.children.length < 2)
    throw new Error(`Parent ${parentId} has fewer than two children`);

  const ordered = [...parent.children].sort(
    (a, b) => (positions.get(a.id)?.x ?? 0) - (positions.get(b.id)?.x ?? 0),
  );

  for (let i = 0; i < ordered.length - 1; i++) {
    const left = ordered[i];
    const right = ordered[i + 1];
    const { subtreeGap } = calcGaps(left, right);

    if (Math.abs(subtreeGap - expected) > 1e-6) {
      console.warn(
        `Warning: ${label}: gap between ${left.id} and ${right.id} was ${subtreeGap}, expected ${expected}`,
      )
    }
  }

  console.log(`\u2713 ${label} (gap ${expected})`);
};

assertGap(7, LEAF_SPACING, "leaf vs non-leaf under parent 7");
assertGap(8, H_SPACING, "two non-leaves under parent 8");
assertGap(21, LEAF_SPACING, "leaf siblings under parent 21");

// Sanity-check that buildScene drives the same layout as layoutTree.
const scenePositions = (() => {
  buildScene(people, null, toggles); // triggers logSiblingGaps internally (labelled "buildScene")
  // rebuild positions via layoutTree to compare
  const { positions: posAgain } = layoutTree(people, sizeMap);
  return posAgain;
})();

const comparePositions = () => {
  const entries = Array.from(positions.entries());
  entries.forEach(([id, pos]) => {
    const other = scenePositions.get(id);
    if (!other) throw new Error(`Missing position for ${id} in scene layout`);
    if (Math.abs(other.x - pos.x) > 1e-6 || Math.abs(other.y - pos.y) > 1e-6) {
      throw new Error(
        `Position mismatch for ${id}: layoutTree (${pos.x},${pos.y}) vs buildScene (${other.x},${other.y})`,
      );
    }
  });
  console.log("✓ buildScene positions match layoutTree");
};

comparePositions();

console.log("All spacing checks passed.");
