import type {
  TraceData,
  Relationship,
  ManualRelationship,
} from "../types/trace";
import problemsDataImport from './problems.json';

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
  const baseTraceData = TRACES[problemId];
  if (!baseTraceData) return undefined;

  // Find the problem data to get manual relationships
  const problemData = problemsDataImport.problems.find(
    (p) => p.id === problemId
  );
  const manualRelationships = (problemData as any)?.manualRelationships as
    | ManualRelationship[]
    | undefined;

  if (!manualRelationships || manualRelationships.length === 0) {
    return baseTraceData;
  }

  // Convert manual relationships to proper Relationship format
  const convertedManualRelationships: Relationship[] = manualRelationships.map(
    (manual, index) => ({
      container: manual.container,
      cursor: manual.cursor,
      type: manual.type,
      node_id: -1 - index, // Use negative IDs to distinguish from AST-generated relationships
    })
  );

  // Merge manual relationships with existing ones
  return {
    ...baseTraceData,
    relationships: [
      ...baseTraceData.relationships,
      ...convertedManualRelationships,
    ],
  };
}
