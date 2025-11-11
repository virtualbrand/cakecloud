'use client'

import Sidebar from "@/components/Sidebar";
import Toaster from "@/components/ui/toast";
import { useState, useEffect, useRef } from "react";
import type { ToasterRef } from "@/components/ui/toast";

// Criar uma instância global do toaster
let globalToasterRef: ToasterRef | null = null;

export const showToast = (props: Parameters<ToasterRef['show']>[0]) => {
  globalToasterRef?.show(props);
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toasterRef = useRef<ToasterRef>(null);

  useEffect(() => {
    globalToasterRef = toasterRef.current;
  }, []);

  useEffect(() => {
    const handleCollapse = ((e: CustomEvent) => {
      setIsCollapsed(e.detail.isCollapsed);
    }) as EventListener;

    window.addEventListener('sidebar-collapse', handleCollapse);
    return () => window.removeEventListener('sidebar-collapse', handleCollapse);
  }, []);

  return (
    <>
      <Toaster ref={toasterRef} defaultPosition="top-right" />
      <Sidebar />
      <main className={`min-h-screen bg-gray-50 p-8 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </>
  );
}
