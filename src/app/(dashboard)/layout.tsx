import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { getAllRolePermissions } from "@/lib/permissions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const permissions = await getAllRolePermissions();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userRole={session.role} permissions={permissions} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar userName={session.name} userRole={session.role} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
