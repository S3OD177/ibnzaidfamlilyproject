import type { ComponentProps } from "react";
import type {
  Excalidraw,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import { hierarchy as d3Hierarchy, tree as d3Tree } from "d3-hierarchy";
import type { HierarchyNode } from "d3-hierarchy";

export type Gender = "male" | "female";

export type Person = {
  id: number;
  name: string;
  parentId: number | null;
  gender: Gender;
  birthYear: number | null;
  deathYear: number | null;
  description: string;
};

export type TreeNode = Person & { children: TreeNode[] };

export type ViewerToggles = {
  showGenderColor: boolean;
  showYears: boolean;
  showDescription: boolean;
};

export type SceneSkeleton = NonNullable<
  Parameters<typeof convertToExcalidrawElements>[0]
>;
export type ExcalidrawAPI = Parameters<
  NonNullable<ComponentProps<typeof Excalidraw>["excalidrawAPI"]>
>[0];

export const MIN_NODE_WIDTH = 100;
export const MAX_NODE_WIDTH = 360;
export const MIN_NODE_HEIGHT = 30;
export const H_SPACING = 15;
export const LEAF_SPACING = 12;
export const V_SPACING = 80;

export const boxIdFor = (personId: number) => `box-${personId}`;

export const isLeaf = (node: TreeNode) => node.children.length === 0;

// Leaves get the small gap; branches get the full gap.
export const gapBetween = (left: TreeNode, right: TreeNode) =>
  isLeaf(left) || isLeaf(right) ? LEAF_SPACING : H_SPACING;

export const buildTree = (
  people: Person[],
): { nodes: Map<number, TreeNode>; roots: TreeNode[] } => {
  const nodes = new Map<number, TreeNode>();
  people.forEach((person) => nodes.set(person.id, { ...person, children: [] }));

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node);
    }
  });

  let roots = Array.from(nodes.values()).filter(
    (node) => !node.parentId || !nodes.has(node.parentId),
  );

  if (!roots.length && nodes.size) {
    roots = [Array.from(nodes.values())[0]];
  }

  return { nodes, roots };
};

export const layoutTree = (
  people: Person[],
  sizeMap: Map<number, { width: number; height: number }>,
): {
  positions: Map<number, { x: number; y: number }>;
  widths: Map<number, number>;
  layoutWidths: Map<number, number>;
} => {
  const { roots, nodes } = buildTree(people);
  const positions = new Map<number, { x: number; y: number }>();
  const widths = new Map<number, number>();
  const layoutWidths = new Map<number, number>();

  if (!roots.length) {
    return { positions, widths, layoutWidths };
  }

  let totalWidth = 0;
  for (const root of roots) {
    const hierarchyRoot = d3Hierarchy(root, (d) => d.children);
    const treeLayout = d3Tree<TreeNode>()
      .nodeSize([MIN_NODE_WIDTH + H_SPACING, V_SPACING])
      .separation((a, b) => {
        return a.parent === b.parent ? 1 : 1.25;
      });

    treeLayout(hierarchyRoot);

    const rootPositions = new Map<number, { x: number; y: number }>();
    hierarchyRoot.each((node: HierarchyNode<TreeNode>) => {
      rootPositions.set(node.data.id, { x: node.x ?? 0, y: node.y ?? 0 });
    });

    let maxW = 0;
    for (const [id, pos] of rootPositions.entries()) {
      const size = sizeMap.get(id);
      if (size) {
        maxW = Math.max(maxW, pos.x + size.width);
      }
    }
    for (const [id, pos] of rootPositions.entries()) {
      positions.set(id, { x: pos.x + totalWidth, y: pos.y });
    }
    totalWidth += maxW + H_SPACING * 4;
  }

  if (!positions.size) return { positions, widths, layoutWidths };

  const minX = Math.min(...Array.from(positions.values()).map((p) => p.x));
  const minY = Math.min(...Array.from(positions.values()).map((p) => p.y));
  const offsetX = 40 - Math.min(0, minX);
  const offsetY = 40 - Math.min(0, minY);

  const shifted = new Map<number, { x: number; y: number }>();
  positions.forEach((pos, id) =>
    shifted.set(id, { x: pos.x + offsetX, y: pos.y + offsetY }),
  );

  nodes.forEach((node) => {
    const pos = shifted.get(node.id);
    const size = sizeMap.get(node.id);
    if (pos && size) {
      widths.set(node.id, size.width);
      layoutWidths.set(node.id, size.width);
    }
  });

  return { positions: shifted, widths, layoutWidths };
};

export const formatYears = (person: Pick<Person, "birthYear" | "deathYear">) =>
  `${person.birthYear ?? "[]"} - ${person.deathYear ?? "[]"}`;

export const computeNodeSize = (
  person: Person,
  toggles: ViewerToggles,
): { width: number; height: number } => {
  const lines = [person.name];
  if (toggles.showYears) lines.push(formatYears(person));
  if (toggles.showDescription)
    lines.push(
      person.description.trim().length ? person.description : "No description",
    );

  const maxChars = Math.max(...lines.map((line) => line.length), 1);
  const approxWidth = maxChars * 8.5 + 32;
  const width = Math.max(
    MIN_NODE_WIDTH,
    Math.min(MAX_NODE_WIDTH, Math.round(approxWidth)),
  );

  let height = 16;
  height += 22;
  if (toggles.showYears) {
    height += 6;
    height += 18;
  }
  if (toggles.showDescription) {
    height += 6;
    height += 16;
  }
  height += 12;
  height = Math.max(MIN_NODE_HEIGHT, height);

  return { width, height };
};

export const buildScene = (
  people: Person[],
  currentFocusId: number | null,
  toggles: ViewerToggles,
): SceneSkeleton => {
  if (!people.length) return [];

  const sizeMap = new Map<number, { width: number; height: number }>();
  people.forEach((person) =>
    sizeMap.set(person.id, computeNodeSize(person, toggles)),
  );

  const { positions, widths, layoutWidths } = layoutTree(people, sizeMap);
  const elements: SceneSkeleton = [];

  type MaybeNodeEnv = {
    process?: { env?: { NODE_ENV?: string } };
  };
  const envNode =
    typeof globalThis === "object"
      ? (globalThis as MaybeNodeEnv).process?.env?.NODE_ENV
      : undefined;
  if (envNode !== "production") {
    try {
      logSiblingGaps(
        people,
        positions,
        widths,
        sizeMap,
        "buildScene",
        layoutWidths,
      );
    } catch (error) {
      console.warn("Unable to log spacing info:", error);
    }
  }

  const { showGenderColor, showYears, showDescription } = toggles;

  people.forEach((person) => {
    const position = positions.get(person.id);
    if (!position) return;

    const { x, y } = position;
    const size = sizeMap.get(person.id);
    const nodeWidth = size?.width ?? MIN_NODE_WIDTH;
    const nodeHeight = size?.height ?? MIN_NODE_HEIGHT;
    const boxId = boxIdFor(person.id);

    const isFocused = currentFocusId === person.id;
    const isMale = person.gender === "male";
    const boxStroke = showGenderColor
      ? isMale
        ? "#1d4ed8"
        : "#db2777"
      : "#1f2937";
    const boxBg = showGenderColor
      ? isMale
        ? "#e0ecff"
        : "#ffe4f0"
      : "#e5e7eb";
    const yearsText = formatYears(person);
    const descriptionText =
      person.description.trim().length > 0
        ? person.description
        : "No description";

    if (isFocused) {
      elements.push({
        id: `focus-${person.id}`,
        type: "rectangle",
        x: x - 12,
        y: y - 12,
        width: nodeWidth + 24,
        height: nodeHeight + 24,
        backgroundColor: "transparent",
        strokeColor: "#2563eb",
        strokeWidth: 4,
        roundness: { type: 3 },
      });
    }

    elements.push({
      id: boxId,
      type: "rectangle",
      x,
      y,
      width: nodeWidth,
      height: nodeHeight,
      backgroundColor: boxBg,
      strokeColor: boxStroke,
      strokeWidth: 2,
      roundness: { type: 2 },
    });

    const textBase = {
      type: "text" as const,
      width: 0,
      height: 0,
      textAlign: "center" as const,
      verticalAlign: "top" as const,
      backgroundColor: "transparent",
      containerId: undefined,
      fontFamily: 1 as const,
    };

    const nameHeight = 22;
    const yearsHeight = 18;
    const descHeight = 16;
    const lineGap = 6;

    let blockHeight = nameHeight;
    if (showYears) blockHeight += lineGap + yearsHeight;
    if (showDescription) blockHeight += lineGap + descHeight;

    let currentY = y + (nodeHeight - blockHeight) / 2;
    elements.push({
      ...textBase,
      id: `name-${person.id}`,
      text: person.name,
      x: x + nodeWidth / 2,
      y: currentY,
      fontSize: 19,
      strokeColor: "#0f172a",
    });

    currentY += nameHeight + lineGap;

    if (showYears) {
      elements.push({
        ...textBase,
        id: `years-${person.id}`,
        text: yearsText,
        x: x + nodeWidth / 2,
        y: currentY,
        fontSize: 13,
        strokeColor: "#1f2937",
      });
      currentY += yearsHeight + lineGap;
    }

    if (showDescription) {
      elements.push({
        ...textBase,
        id: `desc-${person.id}`,
        text: descriptionText,
        x: x + nodeWidth / 2,
        y: currentY,
        fontSize: 12,
        strokeColor: "#334155",
      });
    }
  });

  people.forEach((person) => {
    if (!person.parentId) return;
    const parentPos = positions.get(person.parentId);
    const childPos = positions.get(person.id);
    if (!parentPos || !childPos) return;
    const parentSize = sizeMap.get(person.parentId);
    const childSize = sizeMap.get(person.id);
    const parentWidth = parentSize?.width ?? MIN_NODE_WIDTH;
    const childWidth = childSize?.width ?? MIN_NODE_WIDTH;
    const parentHeight = parentSize?.height ?? MIN_NODE_HEIGHT;

    const startX = parentPos.x + parentWidth / 2;
    const startY = parentPos.y + parentHeight;
    const endX = childPos.x + childWidth / 2;
    const endY = childPos.y;
    const dx = endX - startX;
    const dy = endY - startY;
    const midY = dy / 2;

    const arrow = {
      id: `arrow-${person.parentId}-${person.id}`,
      type: "arrow",
      x: startX,
      y: startY,
      points: [
        [0, 0],
        [0, midY],
        [dx, midY],
        [dx, dy],
      ],
      strokeColor: "#1f2937",
      strokeWidth: 2,
      elbowed: true,
      startArrowhead: null,
      endArrowhead: null,
      startBinding: {
        elementId: boxIdFor(person.parentId),
        focus: 0.5,
        gap: 6,
      },
      endBinding: {
        elementId: boxIdFor(person.id),
        focus: 0.5,
        gap: 6,
      },
    } as SceneSkeleton[number];

    elements.push(arrow);
  });

  return elements;
};

// Debug helper: logs sibling gap sizes so we can verify leaf spacing rules.
export const logSiblingGaps = (
  people: Person[],
  positions: Map<number, { x: number; y: number }>,
  widths: Map<number, number>,
  sizeMap: Map<number, { width: number; height: number }>,
  label = "Sibling gaps",
  layoutWidths?: Map<number, number>,
) => {
  const { nodes, roots } = buildTree(people);
  const depths = new Map<number, number>();
  const fillDepths = (node: TreeNode, depth: number) => {
    depths.set(node.id, depth);
    node.children.forEach((child) => fillDepths(child, depth + 1));
  };
  roots.forEach((root) => fillDepths(root, 0));
  const levelCount = Math.max(...Array.from(depths.values()), 0) + 1;

  const calcGaps = (left: TreeNode, right: TreeNode) => {
    const leftPos = positions.get(left.id);
    const rightPos = positions.get(right.id);
    if (!leftPos || !rightPos)
      return {
        nodeGap: Number.NaN,
        subtreeGap: Number.NaN,
        layoutSubtreeGap: Number.NaN,
      };

    const leftNodeWidth = sizeMap.get(left.id)?.width ?? MIN_NODE_WIDTH;
    const rightNodeWidth = sizeMap.get(right.id)?.width ?? MIN_NODE_WIDTH;
    const compareLeftWidth = widths.get(left.id) ?? leftNodeWidth;
    const compareRightWidth = widths.get(right.id) ?? rightNodeWidth;
    const layoutLeftWidth =
      layoutWidths?.get(left.id) ?? compareLeftWidth ?? leftNodeWidth;
    const layoutRightWidth =
      layoutWidths?.get(right.id) ?? compareRightWidth ?? rightNodeWidth;
    const useNodeWidths = isLeaf(left) || isLeaf(right);

    const leftCenter = leftPos.x + leftNodeWidth / 2;
    const rightCenter = rightPos.x + rightNodeWidth / 2;

    const nodeGap = rightPos.x - (leftPos.x + leftNodeWidth);

    const compareSubtreeGap = (() => {
      if (useNodeWidths) return nodeGap;
      return (
        rightCenter -
        compareRightWidth / 2 -
        (leftCenter + compareLeftWidth / 2)
      );
    })();

    const layoutSubtreeGap = (() => {
      if (!layoutWidths) return Number.NaN;
      if (useNodeWidths) return nodeGap;
      return (
        rightCenter - layoutRightWidth / 2 - (leftCenter + layoutLeftWidth / 2)
      );
    })();

    return { nodeGap, subtreeGap: compareSubtreeGap, layoutSubtreeGap };
  };

  console.log(`Levels in tree: ${levelCount}`);
  console.log(`${label}:`);

  Array.from(nodes.values())
    .filter((node) => node.children.length > 1)
    .sort(
      (a, b) =>
        (depths.get(a.id) ?? 0) - (depths.get(b.id) ?? 0) || a.id - b.id,
    )
    .forEach((parent) => {
      const depth = depths.get(parent.id) ?? 0;
      const parentPos = positions.get(parent.id);
      const parentWidth =
        widths.get(parent.id) ??
        sizeMap.get(parent.id)?.width ??
        MIN_NODE_WIDTH;
      const parentNodeWidth = sizeMap.get(parent.id)?.width ?? MIN_NODE_WIDTH;
      const parentLayoutWidth =
        layoutWidths?.get(parent.id) ?? parentWidth ?? parentNodeWidth;

      console.log(
        `depth ${depth} parent ${parent.name} (${parent.id}) at (${parentPos?.x.toFixed(2)},${parentPos?.y.toFixed(2)}) w(compare=${parentWidth.toFixed(2)}, layout=${parentLayoutWidth.toFixed(2)}, node=${parentNodeWidth.toFixed(2)})`,
      );

      const ordered = [...parent.children].sort(
        (a, b) => (positions.get(a.id)?.x ?? 0) - (positions.get(b.id)?.x ?? 0),
      );

      ordered.slice(0, -1).forEach((left, idx) => {
        const right = ordered[idx + 1];
        const { nodeGap, subtreeGap, layoutSubtreeGap } = calcGaps(left, right);
        const expected = gapBetween(left, right);
        const leftType = isLeaf(left) ? "leaf" : "branch";
        const rightType = isLeaf(right) ? "leaf" : "branch";
        const leftPos = positions.get(left.id);
        const rightPos = positions.get(right.id);
        const leftNodeWidth = sizeMap.get(left.id)?.width ?? MIN_NODE_WIDTH;
        const rightNodeWidth = sizeMap.get(right.id)?.width ?? MIN_NODE_WIDTH;
        const leftWidth =
          widths.get(left.id) ?? sizeMap.get(left.id)?.width ?? MIN_NODE_WIDTH;
        const leftLayoutWidth =
          layoutWidths?.get(left.id) ?? leftWidth ?? leftNodeWidth;
        const rightWidth =
          widths.get(right.id) ??
          sizeMap.get(right.id)?.width ??
          MIN_NODE_WIDTH;
        const rightLayoutWidth =
          layoutWidths?.get(right.id) ?? rightWidth ?? rightNodeWidth;

        console.log(
          `  ${left.name} (${left.id}) [${leftType}] @ (${leftPos?.x.toFixed(2)},${leftPos?.y.toFixed(2)}) w(compare=${leftWidth.toFixed(2)}, layout=${leftLayoutWidth.toFixed(2)}, node=${leftNodeWidth.toFixed(2)})`,
        );
        const layoutGap =
          layoutWidths && Number.isFinite(layoutSubtreeGap)
            ? `, layout subtree gap ${layoutSubtreeGap.toFixed(2)}`
            : "";
        console.log(
          `    -> node gap ${nodeGap.toFixed(2)}, subtree gap ${subtreeGap.toFixed(2)} (expected ${expected})${layoutGap}`,
        );
        console.log(
          `    -> ${right.name} (${right.id}) [${rightType}] @ (${rightPos?.x.toFixed(2)},${rightPos?.y.toFixed(2)}) w(compare=${rightWidth.toFixed(2)}, layout=${rightLayoutWidth.toFixed(2)}, node=${rightNodeWidth.toFixed(2)})`,
        );
      });
    });
};
