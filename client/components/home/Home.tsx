"use client";

import { ReactNode } from "react";
import Sidebar from "../sidebar/sidebar";

export default function HomeLayout({ children }: { children: ReactNode }) {

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main
        className={`transition-all duration-300 flex-1 p-4`}
      >
        {children}
      </main>
    </div>
  );
}
