import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export type PermissionValue = "all" | "own" | "none";

export interface RolePermissions {
  dashboard: PermissionValue;
  accounts: PermissionValue;
  leads: PermissionValue;
  deals: PermissionValue;
  activities: PermissionValue;
  sales: PermissionValue;
  campaigns: PermissionValue;
  reports: PermissionValue;
}

export const DEFAULT_PERMISSIONS: Record<string, RolePermissions> = {
  admin: {
    dashboard: "all",
    accounts: "all",
    leads: "all",
    deals: "all",
    activities: "all",
    sales: "all",
    campaigns: "all",
    reports: "all",
  },
  agent: {
    dashboard: "own",
    accounts: "own",
    leads: "own",
    deals: "own",
    activities: "own",
    sales: "own",
    campaigns: "none",
    reports: "own",
  },
};

export async function getAllRolePermissions(): Promise<Record<string, RolePermissions>> {
  const settings = await prisma.settings.findUnique({ where: { key: "role_permissions" } });
  if (!settings) return DEFAULT_PERMISSIONS;

  try {
    return JSON.parse(settings.value);
  } catch {
    return DEFAULT_PERMISSIONS;
  }
}

export async function getModuleWhere(module: keyof RolePermissions, session: any) {
  if (!session) redirect("/login");

  const allPerms = await getAllRolePermissions();
  const rolePerms = allPerms[session.role as string] || DEFAULT_PERMISSIONS.agent;
  const permValue = rolePerms[module];

  if (permValue === "none") {
    redirect("/dashboard");
  }

  if (permValue === "all") {
    return {};
  }

  // "own"
  return { userId: session.userId };
}
