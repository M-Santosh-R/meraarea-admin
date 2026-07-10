import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getCurrentAdmin } from "@/lib/data/admins";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentAdmin = await getCurrentAdmin();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-[260px] shrink-0 border-r border-border lg:block">
        <div className="fixed h-screen w-[260px]">
          <Sidebar currentAdmin={currentAdmin} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header currentAdmin={currentAdmin} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
