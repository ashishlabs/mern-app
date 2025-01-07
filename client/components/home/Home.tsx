"use client";

import { ReactNode } from "react";
import AuthWrapper from "../auth/AuthWrapper";
import Navigation from "../navigation/Navigation";
import { Toaster } from "../ui/toaster";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Toaster />
      </div>
    </AuthWrapper>
  );
}