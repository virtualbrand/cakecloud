import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <TopBar />
      <main className="ml-64 mt-16 min-h-screen bg-gray-50">
        {children}
      </main>
    </>
  );
}
