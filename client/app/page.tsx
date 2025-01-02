"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/utils/routes";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push(ROUTES.LOGIN);
  }, [router]);

  return null;
}