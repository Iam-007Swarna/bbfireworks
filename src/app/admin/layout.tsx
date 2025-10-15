import type { ReactNode } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProviderWrapper>
      <div className="grid min-h-[70vh] grid-cols-1 md:grid-cols-[240px_1fr] gap-0">
        <aside className="border-r border-gray-200 dark:border-gray-800">
          <Sidebar />
        </aside>
        <section className="min-h-screen">
          <Topbar />
          <div className="p-4">{children}</div>
        </section>
      </div>
    </SessionProviderWrapper>
  );
}