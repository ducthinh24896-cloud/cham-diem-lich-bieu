"use client";

import CalendarPage from "@/components/CalendarPage";
import { useAuth } from "@/lib/Authcontext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // 👉 chưa login thì đá qua login
    }
  }, [user, loading, router]);

  // đang loading → chưa render
  if (loading) {
    return (
      <div className="text-white text-center mt-10">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  // chưa login → không render gì (tránh flash UI)
  if (!user) return null;

  // đã login → render app
  return (
    <>
      <div className="bg-canvas" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <CalendarPage />
    </>
  );
}