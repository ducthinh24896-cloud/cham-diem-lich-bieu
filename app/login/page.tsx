"use client";
import { useAuth } from "@/lib/Authcontext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [name, setName] = useState("");
  const [error, setError] = useState("");

  // 👉 nếu đã login → về trang chính
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // 👉 xử lý login
  async function handleLogin() {
    setError("");
    try {
      await login(email, password);
    } catch (e) {
      setError("❌ Sai tài khoản hoặc mật khẩu!");
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

        <h1 className="text-3xl font-black mb-2">
          Lịch Biểu Chấm Điểm
        </h1>

        <p className="text-white/40 text-sm mb-6">
          Trung đội 9 · 10 · 11 · 12<br />
          Đăng nhập để bắt đầu
        </p>

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
        {error && (
          <div className="text-red-400 text-sm mb-3">{error}</div>
        )}

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

        <p className="text-white/20 text-xs mt-6">
          🔒 Bảo mật bằng Firebase Authentication
        </p>
      </div>
    </div>
  );
}