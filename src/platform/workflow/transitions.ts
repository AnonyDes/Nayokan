// Workflow metadata shared by admin UI and server actions. The database is
// the authority (public.transition_content); this mirrors its transition
// map so the UI can hide impossible actions without a round-trip.

export const WORKFLOW_ACTIONS = [
  "submit",
  "recall",
  "request_changes",
  "approve",
  "schedule",
  "publish",
  "unpublish",
  "archive",
  "restore",
] as const;
export type WorkflowAction = (typeof WORKFLOW_ACTIONS)[number];

export type ContentStatus =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "scheduled"
  | "published"
  | "archived";

export const CONTENT_TABLES = [
  "pages",
  "articles",
  "stories",
  "programmes",
  "clusters",
  "opportunities",
  "mentors",
  "partners",
  "people",
  "ventures",
  "properties",
] as const;
export type ContentTable = (typeof CONTENT_TABLES)[number];

export const TRANSITIONS: Record<WorkflowAction, { from: ContentStatus[]; to: ContentStatus; requiresComment?: boolean; reviewerOnly?: boolean }> = {
  submit: { from: ["draft", "changes_requested"], to: "in_review" },
  recall: { from: ["in_review"], to: "draft" },
  request_changes: { from: ["in_review"], to: "changes_requested", requiresComment: true, reviewerOnly: true },
  approve: { from: ["in_review", "changes_requested"], to: "approved", reviewerOnly: true },
  schedule: { from: ["approved"], to: "scheduled", reviewerOnly: true },
  publish: { from: ["approved", "scheduled"], to: "published", reviewerOnly: true },
  unpublish: { from: ["published"], to: "approved", reviewerOnly: true },
  archive: { from: ["draft", "in_review", "changes_requested", "approved", "scheduled", "published"], to: "archived" },
  restore: { from: ["archived"], to: "draft" },
};

export function allowedActions(status: ContentStatus): WorkflowAction[] {
  return WORKFLOW_ACTIONS.filter((a) => TRANSITIONS[a].from.includes(status));
}

export function isContentTable(t: string): t is ContentTable {
  return (CONTENT_TABLES as readonly string[]).includes(t);
}
