"use client";

import { ReactNode } from "react";

export default function ContainerLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col p-4 sm:p-8 lg:px-48  min-h-screen bg-gray-100">
            <main className="flex-1">
                {children}
            </main>
        </div>

    );
}