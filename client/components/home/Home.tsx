"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AuthWrapper from "../auth/AuthWrapper";
import Navigation from "../navigation/Navigation";
import { Toaster } from "../ui/toaster";

export default function HomeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showNavigation = !pathname?.includes('songs');

  return (
    <AuthWrapper>
      <div className="min-h-screen flex flex-col">
        {showNavigation && <Navigation />}
        <main className="flex-1">
          {children}
        </main>
        <Toaster />
      </div>
    </AuthWrapper>
  );
}