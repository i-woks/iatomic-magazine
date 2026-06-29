/**
 * The 5 canonical main science branches.
 * These drive the colored tag shown on article cards and the editor's
 * "main branch" selector. They form a compatibility layer over the existing
 * `categories` table: a category whose name matches a branch inherits its
 * brand color; otherwise the category's own accentColor is used.
 */
export interface MainBranch {
  id: string;
  name: string;       // Persian display name
  english: string;
  color: string;      // brand accent
}

export const MAIN_BRANCHES: MainBranch[] = [
  { id: "physics", name: "فیزیک", english: "Physics", color: "#1565C0" },
  { id: "chemistry", name: "شیمی", english: "Chemistry", color: "#00CFA6" },
  { id: "bio-med", name: "زیست‌شناسی / پزشکی", english: "Biology / Medicine", color: "#2E7D32" },
  { id: "earth-space", name: "زمین و فضا", english: "Earth & Space", color: "#FF6F00" },
  { id: "ai-tech", name: "هوش مصنوعی / فناوری / داده", english: "AI / Technology / Data", color: "#6A1B9A" },
];

/** Resolve the accent color for a main-branch / category label. */
export function branchColor(name?: string | null, fallback = "#1565C0"): string {
  if (!name) return fallback;
  const hit = MAIN_BRANCHES.find((b) => b.name === name.trim());
  return hit?.color ?? fallback;
}

export function findBranchByName(name?: string | null): MainBranch | undefined {
  if (!name) return undefined;
  return MAIN_BRANCHES.find((b) => b.name === name.trim());
}
