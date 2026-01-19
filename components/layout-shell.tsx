"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";

type LayoutShellProps = {
  children: React.ReactNode;
};

export default function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const hideSidebar = pathname === "/login";

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
