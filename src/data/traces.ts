import type { TraceData } from "../types/trace";

// Dynamically import all trace files from the public/traces directory
const traceModules = import.meta.glob("./traces/*.json", {
  eager: true,
  import: "default",
});

// Transform the file paths into problem IDs and create the TRACES object
export const TRACES: Record<string, TraceData> = {};

for (const path in traceModules) {
  // Extract filename without extension from path like '../../public/traces/two-sum.json'
  const filename = path.split("/").pop()?.replace(".json", "");
  if (filename && traceModules[path]) {
    TRACES[filename] = traceModules[path] as TraceData;
  }
}

// Export available problem IDs from JSON file
export const AVAILABLE_PROBLEM_IDS: string[] = Object.keys(TRACES);
// Helper function to get trace data for a specific problem
export function getTraceData(problemId: string): TraceData | undefined {
  return TRACES[problemId];
}
