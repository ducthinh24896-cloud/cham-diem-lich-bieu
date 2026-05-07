"use client";
import { useAuth } from "@/lib/Authcontext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const { user, role, loading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 👉 nếu đã login → về trang chính
  useEffect(() => {
    if (loading) return;

    if (user && role === "user") {
      router.push("/");
    } else if (user && role === "admin") {
      router.push("/admin");
    }
  }, [user, role, loading, router]);

  // 👉 xử lý login
  async function handleLogin() {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const token = await cred.user.getIdToken();

      // save cookie
      await fetch("/api/session", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          token,
        }),
      });

      window.location.href = "/admin";
    } catch (err) {
      console.error(err);

      alert("Sai tài khoản");
    }
  }

  if (loading) {
    return (
      <div className="text-white text-center mt-10">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-10 text-center w-full max-w-[420px]">
        <div className="text-6xl mb-4">📋</div>

        <h1 className="text-3xl font-black mb-2">Lịch Biểu Chấm Điểm</h1>

        <p className="text-white/40 text-sm mb-6">Form Đăng nhập</p>

        {/* EMAIL */}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tên đăng nhập (email)"
          className="w-full mb-3 p-3 rounded-xl outline-none"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        />

        {/* PASSWORD */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          className="w-full mb-4 p-3 rounded-xl outline-none"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        />

        {/* ERROR */}
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

        {/* BUTTON LOGIN */}
        <button
          onClick={handleLogin}
          disabled={!email || !password}
          className="w-full py-3 rounded-xl font-bold disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg,#059669,#34d399)",
            color: "#fff",
          }}
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
