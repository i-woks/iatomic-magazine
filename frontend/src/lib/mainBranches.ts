/**
 * Five canonical top-level branches for Atomic Magazine.
 * Main colored chip = one of these branches; subtopics live in related gray tags.
 */
export interface MainBranch {
  id: string;
  name: string;
  english: string;
  color: string;
}

export const MAIN_BRANCHES: MainBranch[] = [
  { id: "fundamental", name: "علوم پایه", english: "Fundamental Sciences", color: "#1565C0" },
  { id: "cs-ai", name: "علوم رایانه و هوش مصنوعی", english: "Computer Science & AI", color: "#6A1B9A" },
  { id: "engineering", name: "مهندسی و فناوری", english: "Engineering & Technology", color: "#00CFA6" },
  { id: "medicine-life", name: "پزشکی و علوم زیستی", english: "Medicine & Life Sciences", color: "#2E7D32" },
  { id: "humanities", name: "علوم انسانی و اجتماعی", english: "Humanities & Social Sciences", color: "#FF6F00" },
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
