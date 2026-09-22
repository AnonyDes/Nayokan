// Role → permission matrix. Mirrors Designs/admin/roles-permissions.html
// exactly (§ H · 05). MOCK SEED: Session B owns `roles` / `role_permissions`
// in Supabase (readiness-report.md §9, "Global / platform"). This module is
// the source of truth until that schema lands, then `directory.ts` reads the
// same shape from the database instead of this table.
import type { PermissionArea, PermissionLevel, RoleId } from "./types";

type Matrix = Record<RoleId, Record<PermissionArea, PermissionLevel>>;

const full = (): Record<PermissionArea, PermissionLevel> => ({
  pages: "full",
  articles: "full",
  stories: "full",
  media: "full",
  programmes: "full",
  applications: "full",
  people: "full",
  partners: "full",
  portfolio: "full",
  properties: "full",
  impact_metrics: "full",
  evidence: "full",
  website: "full",
  enquiries: "full",
  users: "full",
  roles: "full",
  audit_log: "full",
  settings: "full",
});

export const ROLE_PERMISSIONS: Matrix = {
  super_admin: full(),

  content_editor: {
    pages: "full",
    articles: "full",
    stories: "full",
    media: "full",
    programmes: "view",
    applications: "none",
    people: "full",
    partners: "view",
    portfolio: "none",
    properties: "view",
    impact_metrics: "view",
    evidence: "view",
    website: "full",
    enquiries: "view",
    users: "none",
    roles: "none",
    audit_log: "view",
    settings: "none",
  },

  programme_manager: {
    pages: "view",
    articles: "view",
    stories: "full",
    media: "full",
    programmes: "full",
    applications: "full",
    people: "full",
    partners: "view",
    portfolio: "view",
    properties: "view",
    impact_metrics: "view",
    evidence: "view",
    website: "view",
    enquiries: "view",
    users: "none",
    roles: "none",
    audit_log: "view",
    settings: "none",
  },

  communications: {
    pages: "full",
    articles: "full",
    stories: "full",
    media: "full",
    programmes: "view",
    applications: "none",
    people: "full",
    partners: "full",
    portfolio: "view",
    properties: "full",
    impact_metrics: "view",
    evidence: "view",
    website: "full",
    enquiries: "full",
    users: "none",
    roles: "none",
    audit_log: "view",
    settings: "none",
  },

  impact_manager: {
    pages: "view",
    articles: "view",
    stories: "full",
    media: "full",
    programmes: "view",
    applications: "none",
    people: "view",
    partners: "view",
    portfolio: "view",
    properties: "view",
    impact_metrics: "full",
    evidence: "full",
    website: "none",
    enquiries: "none",
    users: "none",
    roles: "none",
    audit_log: "view",
    settings: "none",
  },

  reviewer: {
    pages: "review",
    articles: "review",
    stories: "review",
    media: "view",
    programmes: "review",
    applications: "review",
    people: "review",
    partners: "review",
    portfolio: "review",
    properties: "review",
    impact_metrics: "review",
    evidence: "review",
    website: "review",
    enquiries: "view",
    users: "none",
    roles: "none",
    audit_log: "view",
    settings: "none",
  },
};

/** Areas gated behind dual super-admin approval (roles-permissions.html §Administration). */
export const DANGEROUS_AREAS: readonly PermissionArea[] = ["users", "roles", "settings"];

export const ROLE_LABELS: Record<RoleId, string> = {
  super_admin: "Super Admin",
  content_editor: "Content Editor",
  programme_manager: "Programme Manager",
  communications: "Communications",
  impact_manager: "Impact Manager",
  reviewer: "Reviewer",
};
