import { prisma } from "@/lib/prisma";
import SettingsView from "@/components/settings/SettingsView";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Paramètres — NexCRM" };

export default async function SettingsPage() {
  const s = await prisma.settings.findMany();
  
  const settingsMap = s.reduce((acc: any, current: any) => {
    acc[current.key] = current.value;
    return acc;
  }, {} as Record<string, string>);

  return <SettingsView initialSettings={settingsMap} />;
}
