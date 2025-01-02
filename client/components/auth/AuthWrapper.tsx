"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/utils/routes";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push(ROUTES.LOGIN);
    }
  }, [router]);

  return <>{children}</>;
};

export default AuthWrapper;