"use client";

import { ReactNode } from "react";
import Sidebar from "../sidebar/sidebar";
import AuthWrapper from "../auth/AuthWrapper";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper>
      <div className="min-h-screen flex">
        <Sidebar />
        <main className={`transition-all duration-300 flex-1 p-4`}>
          {children}
        </main>
      </div>
    </AuthWrapper>
  );
}