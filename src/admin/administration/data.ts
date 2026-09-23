// MOCK administration data — users, pending dual-approvals, role matrix
// (runtime copy of platform/auth/roles.ts until Session B's role_permissions
// is wired into the auth seam), settings. Rows mirror users.html /
// roles-permissions.html / settings.html.
import "server-only";
import { filterByQuery, filterByStatus, paginate, type ListQuery, type Page } from "@/admin/data/query";
import { mockGet, mockId, mockInsert, mockList, mockRemove, mockUpdate } from "@/admin/data/mock-store";
import { DANGEROUS_AREAS, ROLE_PERMISSIONS } from "@/platform/auth/roles";
import type { PermissionArea, PermissionLevel, RoleId } from "@/platform/auth/types";
import type { AdminUser, NotificationPref, OrgSettings, PendingApproval, RoleMatrix, SecuritySettings, UserStats, WebsiteDefaults } from "./types";

const DEMO = { isDemo: true } as const;
const USERS = "admin_users";
const APPROVALS = "pending_approvals";
const MATRIX = "role_matrix";
const SETTINGS = "admin_settings";

// — users (mirrors Designs/admin/users.html rows) —

const SEED_USERS: AdminUser[] = [
  { id: "usr-1", email: "maria.ndongo@nayokan.cm", name: "Maria Ndongo", sub: "Owner · founder", role: "super_admin", status: "active", twoFaEnrolled: true, lastActiveLabel: "Now", lastActiveDays: 0, provenance: { ...DEMO } },
  { id: "usr-2", email: "david.ekwe@nayokan.cm", name: "David Ekwe", sub: "Institutional lead", role: "super_admin", status: "active", twoFaEnrolled: true, lastActiveLabel: "1h ago", lastActiveDays: 0, provenance: { ...DEMO } },
  { id: "usr-3", email: "sarah.ndenge@nayokan.cm", name: "Sarah Ndenge", sub: "Communications lead", role: "communications", status: "active", twoFaEnrolled: true, lastActiveLabel: "2h ago", lastActiveDays: 0, provenance: { ...DEMO } },
  { id: "usr-4", email: "john.bekolo@nayokan.cm", name: "John Bekolo", sub: "Programme manager", role: "programme_manager", status: "active", twoFaEnrolled: true, lastActiveLabel: "3h ago", lastActiveDays: 0, provenance: { ...DEMO } },
  { id: "usr-5", email: "aissa.tchoumi@nayokan.cm", name: "Aïssa Tchoumi", sub: "Field & stories", role: "content_editor", status: "active", twoFaEnrolled: true, lastActiveLabel: "Yesterday", lastActiveDays: 1, provenance: { ...DEMO } },
  { id: "usr-6", email: "impact.analyst@nayokan.cm", name: "Impact analyst · to be confirmed", sub: "Impact office", role: "impact_manager", status: "active", twoFaEnrolled: true, lastActiveLabel: "2d ago", lastActiveDays: 2, provenance: { ...DEMO } },
  { id: "usr-7", email: "reviewer.1@nayokan.cm", name: "Reviewer · leadership", sub: "Reviewer only", role: "reviewer", status: "active", twoFaEnrolled: true, lastActiveLabel: "4d ago", lastActiveDays: 4, provenance: { ...DEMO } },
  { id: "usr-8", email: "contractor.old@nayokan.cm", name: "Former contractor", sub: "Removed access", role: "content_editor", status: "disabled", twoFaEnrolled: false, lastActiveLabel: "Disabled Sept 20", lastActiveDays: null, provenance: { ...DEMO } },
];

export function listUsers(query: ListQuery & { role?: string }): Page<AdminUser> {
  let rows = mockList(USERS, () => SEED_USERS);
  rows = filterByStatus(rows, query.status, (r) => r.status);
  rows = filterByStatus(rows, query.role, (r) => r.role);
  rows = filterByQuery(rows, query.q, (r) => [r.name, r.email, r.sub]);
  return paginate(rows, query.page, query.pageSize ?? 12);
}

export function userStatusCounts(): Record<string, number> {
  const rows = mockList(USERS, () => SEED_USERS);
  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}

export function userStats(): UserStats {
  const rows = mockList(USERS, () => SEED_USERS);
  const active = rows.filter((r) => r.status === "active");
  return {
    total: rows.length,
    active: active.length,
    disabled: rows.filter((r) => r.status === "disabled").length,
    invited: rows.filter((r) => r.status === "invited").length,
    superAdmins: rows.filter((r) => r.role === "super_admin" && r.status === "active").length,
    twoFaCoverage: active.length ? Math.round((active.filter((r) => r.twoFaEnrolled).length / active.length) * 100) : 0,
    stale: active.filter((r) => (r.lastActiveDays ?? 999) > 30).length,
  };
}

export const getUser = (id: string) => mockGet(USERS, () => SEED_USERS, id);
export const getUserByEmail = (email: string) => mockList(USERS, () => SEED_USERS).find((u) => u.email === email.toLowerCase()) ?? null;
export const saveUser = (id: string, patch: Partial<AdminUser>) => mockUpdate(USERS, () => SEED_USERS, id, patch);

export function insertUser(input: { name: string; email: string; role: RoleId }): AdminUser {
  return mockInsert(USERS, () => SEED_USERS, {
    id: mockId("usr"),
    email: input.email.toLowerCase(),
    name: input.name,
    sub: "Invited — first sign-in pending",
    role: input.role,
    status: "invited",
    twoFaEnrolled: false,
    lastActiveLabel: "Not yet",
    lastActiveDays: null,
    provenance: { ...DEMO },
  });
}

// — role matrix (runtime copy; the auth seam still reads roles.ts until
//    Session B's role_permissions table is wired into hasPermission) —

interface MatrixRow {
  id: RoleId;
  permissions: Record<PermissionArea, PermissionLevel>;
}

function seedMatrix(): MatrixRow[] {
  return (Object.keys(ROLE_PERMISSIONS) as RoleId[]).map((role) => ({
    id: role,
    permissions: { ...ROLE_PERMISSIONS[role] },
  }));
}

export function getRoleMatrix(): RoleMatrix {
  const rows = mockList(MATRIX, seedMatrix);
  return Object.fromEntries(rows.map((r) => [r.id, { ...r.permissions }])) as RoleMatrix;
}

export function setRolePermission(role: RoleId, area: PermissionArea, level: PermissionLevel): void {
  const row = mockGet(MATRIX, seedMatrix, role);
  if (!row) return;
  mockUpdate(MATRIX, seedMatrix, role, { permissions: { ...row.permissions, [area]: level } });
}

export const isDangerousArea = (area: PermissionArea) => (DANGEROUS_AREAS as readonly PermissionArea[]).includes(area);

// — pending approvals —

const SEED_APPROVALS: PendingApproval[] = [
  {
    id: "pa-1",
    kind: "role_permission",
    label: "Grant Impact Manager full access to Site configuration",
    detail: "roles · impact_manager · site_config → full",
    payload: { role: "impact_manager", area: "site_config", level: "full" },
    requestedBy: "Maria Ndongo",
    requestedById: "seed-usr-1",
    requestedAt: "Yesterday · 16:40",
    provenance: { ...DEMO },
  },
];

export function listPendingApprovals(): PendingApproval[] {
  return mockList(APPROVALS, () => SEED_APPROVALS);
}

export function getApproval(id: string): PendingApproval | null {
  return mockGet(APPROVALS, () => SEED_APPROVALS, id);
}

export function insertApproval(a: Omit<PendingApproval, "id" | "provenance">): PendingApproval {
  return mockInsert(APPROVALS, () => SEED_APPROVALS, { id: mockId("pa"), provenance: { ...DEMO }, ...a });
}

export function removeApproval(id: string): boolean {
  return mockRemove(APPROVALS, id);
}

// — settings —

interface SettingsRow {
  id: "org" | "web" | "sec";
  org?: OrgSettings;
  web?: WebsiteDefaults;
  sec?: SecuritySettings;
}

const SEED_SETTINGS: SettingsRow[] = [
  {
    id: "org",
    org: {
      id: "org",
      legalName: "Nayokan · Cameroonian development institution",
      contactEmail: "hello@nayokan.cm",
      address: "Yaoundé · Centre Region · Cameroon\nAddress line to be confirmed",
      linkedin: "nayokan",
      twitter: "nayokan_cm",
      youtube: "nayokan",
    },
  },
  { id: "web", web: { id: "web", defaultLang: "EN", supportedLangs: ["EN", "FR"], ogLabel: "DEFAULT OG · 1200 × 630" } },
  { id: "sec", sec: { id: "sec", require2fa: true, sessionTimeout: "60", dualApproval: true } },
];

export function getOrgSettings(): OrgSettings {
  return collectionGet("org").org!;
}
export function getWebsiteDefaults(): WebsiteDefaults {
  return collectionGet("web").web!;
}
export function getSecuritySettings(): SecuritySettings {
  return collectionGet("sec").sec!;
}

function collectionGet(id: SettingsRow["id"]): SettingsRow {
  return mockGet(SETTINGS, () => SEED_SETTINGS, id) ?? { id };
}

export function saveOrgSettings(patch: Partial<OrgSettings>): void {
  const row = collectionGet("org");
  mockUpdate(SETTINGS, () => SEED_SETTINGS, "org", { org: { ...row.org!, ...patch } });
}

export function saveWebsiteDefaults(patch: Partial<WebsiteDefaults>): void {
  const row = collectionGet("web");
  mockUpdate(SETTINGS, () => SEED_SETTINGS, "web", { web: { ...row.web!, ...patch } });
}

export function saveSecuritySettings(patch: Partial<SecuritySettings>): void {
  const row = collectionGet("sec");
  mockUpdate(SETTINGS, () => SEED_SETTINGS, "sec", { sec: { ...row.sec!, ...patch } });
}

// — notification delivery preferences (settings.html · Notifications panel) —

const SEED_NOTIF_PREFS: NotificationPref[] = [
  { id: "np-1", event: "New application received", email: true, inApp: true, digest: "Daily 08:00" },
  { id: "np-2", event: "Article awaiting review", email: true, inApp: true, digest: "Real-time" },
  { id: "np-3", event: "Impact metric requires verification", email: true, inApp: true, digest: "Real-time" },
  { id: "np-4", event: "Programme deadline approaching", email: true, inApp: true, digest: "Daily 08:00" },
  { id: "np-5", event: "Enquiry assigned to you", email: true, inApp: true, digest: "Real-time" },
  { id: "np-6", event: "Content approved / published", email: false, inApp: true, digest: "Daily 08:00" },
];

export const listNotificationPrefs = () => mockList("notification_prefs", () => SEED_NOTIF_PREFS);
export const setNotificationPref = (id: string, channel: "email" | "inApp", on: boolean) =>
  mockUpdate("notification_prefs", () => SEED_NOTIF_PREFS, id, { [channel]: on });

/** Roles rendered in the matrix header, with headcounts derived from users. */
export function roleHeadcounts(): Record<RoleId, number> {
  const users = mockList(USERS, () => SEED_USERS);
  const out = {} as Record<RoleId, number>;
  for (const role of Object.keys(ROLE_PERMISSIONS) as RoleId[]) out[role] = users.filter((u) => u.role === role && u.status !== "disabled").length;
  return out;
}

export const MATRIX_SECTIONS: { label: string; areas: { area: PermissionArea; label: string; sub: string }[] }[] = [
  {
    label: "Content",
    areas: [
      { area: "pages", label: "Pages", sub: "Institutional pages" },
      { area: "articles", label: "Articles & insights", sub: "Editorial" },
      { area: "stories", label: "Stories", sub: "Case studies · beneficiary outcomes" },
      { area: "media", label: "Media library", sub: "Upload · metadata · alt text" },
    ],
  },
  {
    label: "Programmes",
    areas: [
      { area: "programmes", label: "Programmes & clusters", sub: "VTI / Startup / Opportunities" },
      { area: "applications", label: "Applications", sub: "Applicant intake · decisions" },
    ],
  },
  {
    label: "Ecosystem",
    areas: [
      { area: "people", label: "People & mentors", sub: "Leadership · staff · mentors" },
      { area: "partners", label: "Partners", sub: "Institutional relationships" },
      { area: "ventures", label: "Portfolio / ventures", sub: "VC portfolio" },
      { area: "properties", label: "Hospitality properties", sub: "Guesthouses · short-stay" },
    ],
  },
  {
    label: "Impact governance",
    areas: [
      { area: "impact_metrics", label: "Impact metrics", sub: "Values · verification" },
      { area: "evidence", label: "Evidence library", sub: "Sources · verification records" },
    ],
  },
  {
    label: "Website",
    areas: [
      { area: "site_config", label: "Homepage · navigation · SEO", sub: "Public website" },
      { area: "enquiries", label: "Enquiries", sub: "Contact · partnership · VC" },
    ],
  },
  {
    label: "Administration",
    areas: [
      { area: "users", label: "Users", sub: "Staff accounts" },
      { area: "roles", label: "Roles & permissions", sub: "This screen" },
      { area: "audit_log", label: "Audit log", sub: "System-wide activity" },
      { area: "settings", label: "Settings", sub: "Organization · integrations" },
    ],
  },
];
