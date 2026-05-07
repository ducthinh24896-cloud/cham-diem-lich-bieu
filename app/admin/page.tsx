"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  Plus,
  Trash2,
  Save,
  UserPlus,
  Pencil,
  Shield,
  Users,
  Settings2,
  LogOut,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/Authcontext";
import { checkAdmin } from "@/lib/checkAdmin";

type ScoreCategory = {
  key: string;
  label: string;
};

type UserType = {
  id: string;
  email: string;
  role: string;
  username?: string;
};

type SystemConfig = {
  trungDois: number[];

  scoreCategories: ScoreCategory[];

  tdColors: Record<number, string>;

  tdIcons: Record<number, string>;
};

const DEFAULT_CONFIG: SystemConfig = {
  trungDois: [9, 10, 11, 12],

  scoreCategories: [
    { key: "nd1", label: "Nội dung I" },
    { key: "nd2", label: "Nội dung II" },
    { key: "nd3", label: "Nội dung III" },
    { key: "nd4", label: "Nội dung IV" },
  ],

  tdColors: {
    9: "#FF6B6B",
    10: "#34d399",
    11: "#38bdf8",
    12: "#fbbf24",
  },

  tdIcons: {
    9: "🔴",
    10: "🟢",
    11: "🔵",
    12: "🟡",
  },
};

export default function AdminPage() {
  // ================= CONFIG =================

  const [config, setConfig] =
    useState<SystemConfig>(DEFAULT_CONFIG);

  // ================= USERS =================

  const [users, setUsers] = useState<UserType[]>([]);

  // create user
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [newRole, setNewRole] =
    useState("user");
const [loadingPage, setLoadingPage] = useState(false);
const { user, loading ,  role, } =
  useAuth();

useEffect(() => {
  if (loading) return;

  if (!user) {
    window.location.href = "/login";
    return;
  }

  if (role !== "admin") {
    window.location.href = "/";
  }
}, [user, loading, role]);





  // ================= LOAD =================

  async function loadConfig() {
    const snap = await getDoc(
      doc(db, "config", "system")
    );

    if (snap.exists()) {
      setConfig(
        snap.data() as SystemConfig
      );
    } else {
      await setDoc(
        doc(db, "config", "system"),
        DEFAULT_CONFIG
      );

      setConfig(DEFAULT_CONFIG);
    }
  }

async function loadUsers() {
  try {
    const snap = await getDocs(
      collection(db, "users")
    );

    const arr: UserType[] = [];

    snap.forEach((d) => {
      arr.push({
        id: d.id,
        ...(d.data() as any),
      });
    });

    setUsers(arr);
  } catch (err) {
    console.error(
      "Lỗi load users:",
      err
    );
  }
}
 useEffect(() => {
  if (role !== "admin") return;

  loadUsers();
  loadConfig();
}, [role]);

  // ================= SAVE CONFIG =================

  async function saveConfig() {
    setLoadingPage(true);

    try {
      await updateDoc(
        doc(db, "config", "system"),
        {
          trungDois: config.trungDois,

          scoreCategories:
            config.scoreCategories,

          tdColors: config.tdColors,

          tdIcons: config.tdIcons,
        }
      );

      alert("✅ Đã lưu cấu hình");
    } catch (err) {
      console.error(err);

      alert("❌ Lỗi lưu cấu hình");
    }

    setLoadingPage(false);
  }

  // ================= TRUNG DOI =================

  function addTrungDoi() {
    setConfig((prev) => ({
      ...prev,

      trungDois: [
        ...prev.trungDois,
        0,
      ],
    }));
  }

  function removeTrungDoi(index: number) {
    const td =
      config.trungDois[index];

    const arr =
      config.trungDois.filter(
        (_, i) => i !== index
      );

    const colors = {
      ...config.tdColors,
    };

    const icons = {
      ...config.tdIcons,
    };

    delete colors[td];
    delete icons[td];

    setConfig({
      ...config,
      trungDois: arr,
      tdColors: colors,
      tdIcons: icons,
    });
  }

  // ================= CATEGORY =================

  function addCategory() {
    setConfig((prev) => ({
      ...prev,

      scoreCategories: [
        ...prev.scoreCategories,
        {
          key: "",
          label: "",
        },
      ],
    }));
  }

  function removeCategory(
    index: number
  ) {
    setConfig((prev) => ({
      ...prev,

      scoreCategories:
        prev.scoreCategories.filter(
          (_, i) => i !== index
        ),
    }));
  }

  // ================= USER =================

  async function createUser() {
    if (
      !newEmail ||
      !newPassword
    ) {
      alert(
        "⚠️ Nhập email và mật khẩu"
      );

      return;
    }

    try {
      // 👉 Chỉ tạo document demo
      // THỰC TẾ:
      // dùng Firebase Admin SDK backend

      const id =
        Date.now().toString();

      await setDoc(
        doc(db, "users", id),
        {
          email: newEmail,
          username: newUsername,
          role: newRole,
          createdAt:
            new Date().toISOString(),
        }
      );

      alert("✅ Đã tạo user");

      setNewEmail("");
      setNewPassword("");
      setNewUsername("");

      loadUsers();
    } catch (err) {
      console.error(err);

      alert("❌ Lỗi tạo user");
    }
  }

  async function updateUserRole(
    id: string,
    role: string
  ) {
    await updateDoc(
      doc(db, "users", id),
      {
        role,
      }
    );

    loadUsers();
  }

  async function deleteUser(
    id: string
  ) {
    if (
      !confirm("Xóa user này?")
    )
      return;

    await deleteDoc(
      doc(db, "users", id)
    );

    loadUsers();
  }

async function handleLogout() {
  await signOut(auth);

  await fetch("/api/session", {
    method: "DELETE",
  });

  window.location.href = "/login";
}

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Đang kiểm tra quyền...
    </div>
  );
}

if (!user) return null;

if (role !== "admin") return null;

  return (
  <div
    className="min-h-screen text-white p-6 relative overflow-hidden"
    style={{
      background: `
      radial-gradient(circle at top left, rgba(168,85,247,.25), transparent 25%),
      radial-gradient(circle at bottom right, rgba(14,165,233,.22), transparent 25%),
      linear-gradient(135deg,#050816,#0f172a,#111827)
      `,
    }}
  >
    {/* BACKGROUND GLOW */}
    <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] rounded-full bg-purple-500/20 blur-3xl" />

    <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] rounded-full bg-cyan-500/20 blur-3xl" />

    <div className="relative z-10 max-w-7xl mx-auto space-y-8">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

        <div>

          <h1
            className="text-5xl font-black mb-3 tracking-tight"
            style={{
              background:
                "linear-gradient(135deg,#38bdf8,#818cf8,#f472b6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ⚙️ ADMIN PANEL
          </h1>

          <div className="text-white/50 text-lg">
            Quản lý hệ thống • tài khoản • cấu hình thi đua
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="
          flex items-center gap-2
          px-5 py-3
          rounded-2xl
          bg-red-500/10
          border border-red-500/20
          text-red-300
          hover:bg-red-500/20
          hover:scale-105
          transition-all duration-300
          shadow-lg shadow-red-500/10
          "
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>

      {/* ================================================= */}
      {/* CONFIG */}
      {/* ================================================= */}

      <div
        className="
        rounded-[32px]
        p-7
        backdrop-blur-2xl
        border border-white/10
        shadow-2xl
        bg-white/[0.06]
        relative overflow-hidden
        "
      >
        {/* glow */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg,rgba(168,85,247,.25),transparent,rgba(14,165,233,.25))",
          }}
        />

        <div className="relative z-10">

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/20">
              <Settings2 className="text-cyan-300" />
            </div>

            <h2 className="text-3xl font-black">
              Cấu hình hệ thống
            </h2>
          </div>

          {/* ================= TRUNG DOI ================= */}

          <div className="mb-10">

            <div className="font-bold text-xl mb-4">
              Trung đội
            </div>

            <div className="space-y-4">

              {config.trungDois.map((td, index) => (
                <div
                  key={index}
                  className="
                  grid grid-cols-12 gap-3 items-center
                  bg-white/[0.04]
                  border border-white/10
                  rounded-2xl
                  p-4
                  hover:bg-white/[0.07]
                  transition-all
                  "
                >

                  {/* TD */}

                  <input
                    type="number"
                    value={td}
                    onChange={(e) => {
                      const arr = [...config.trungDois];

                      const oldTd = arr[index];

                      const newTd = parseInt(
                        e.target.value
                      );

                      arr[index] = newTd;

                      const colors = {
                        ...config.tdColors,
                      };

                      const icons = {
                        ...config.tdIcons,
                      };

                      colors[newTd] =
                        colors[oldTd] || "#ffffff";

                      icons[newTd] =
                        icons[oldTd] || "⚪";

                      delete colors[oldTd];

                      delete icons[oldTd];

                      setConfig({
                        ...config,
                        trungDois: arr,
                        tdColors: colors,
                        tdIcons: icons,
                      });
                    }}
                    className="
                    col-span-2
                    px-4 py-3
                    rounded-2xl
                    bg-white/10
                    border border-white/10
                    focus:outline-none
                    focus:ring-2
                    focus:ring-cyan-400/60
                    "
                  />

                  {/* COLOR */}

                  <input
                    type="color"
                    value={
                      config.tdColors?.[td] ||
                      "#ffffff"
                    }
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,

                        tdColors: {
                          ...prev.tdColors,

                          [td]:
                            e.target.value,
                        },
                      }))
                    }
                    className="
                    col-span-2
                    h-12
                    rounded-2xl
                    bg-transparent
                    border border-white/10
                    "
                  />

                  {/* ICON */}

                  <input
                    value={
                      config.tdIcons?.[td] || ""
                    }
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,

                        tdIcons: {
                          ...prev.tdIcons,

                          [td]:
                            e.target.value,
                        },
                      }))
                    }
                    className="
                    col-span-4
                    px-4 py-3
                    rounded-2xl
                    bg-white/10
                    border border-white/10
                    focus:outline-none
                    focus:ring-2
                    focus:ring-cyan-400/60
                    "
                    placeholder="Icon"
                  />

                  {/* PREVIEW */}

                  <div
                    className="col-span-2 text-xl font-black"
                    style={{
                      color:
                        config.tdColors?.[td],
                    }}
                  >
                    {config.tdIcons?.[td]} TD {td}
                  </div>

                  {/* DELETE */}

                  <button
                    onClick={() =>
                      removeTrungDoi(index)
                    }
                    className="
                    col-span-2
                    w-12 h-12
                    rounded-2xl
                    flex items-center justify-center
                    bg-red-500/10
                    border border-red-500/20
                    text-red-300
                    hover:bg-red-500/20
                    hover:scale-110
                    transition-all
                    "
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addTrungDoi}
              className="
              mt-5
              px-5 py-3
              rounded-2xl
              bg-gradient-to-r from-green-500 to-emerald-500
              font-bold
              flex items-center gap-2
              hover:scale-105
              transition-all
              shadow-lg shadow-green-500/20
              "
            >
              <Plus size={18} />
              Thêm trung đội
            </button>
          </div>

          {/* ================= CATEGORY ================= */}

          <div className="mb-10">

            <div className="font-bold text-xl mb-4">
              Nội dung chấm điểm
            </div>

            <div className="space-y-4">

              {config.scoreCategories.map(
                (cat, index) => (
                  <div
                    key={index}
                    className="
                    grid grid-cols-12 gap-3
                    bg-white/[0.04]
                    border border-white/10
                    rounded-2xl
                    p-4
                    "
                  >

                    {/* KEY */}

                    <input
                      value={cat.key}
                      onChange={(e) => {
                        const arr = [
                          ...config.scoreCategories,
                        ];

                        arr[index].key =
                          e.target.value;

                        setConfig({
                          ...config,
                          scoreCategories:
                            arr,
                        });
                      }}
                      className="
                      col-span-3
                      px-4 py-3
                      rounded-2xl
                      bg-white/10
                      border border-white/10
                      "
                      placeholder="key"
                    />

                    {/* LABEL */}

                    <input
                      value={cat.label}
                      onChange={(e) => {
                        const arr = [
                          ...config.scoreCategories,
                        ];

                        arr[index].label =
                          e.target.value;

                        setConfig({
                          ...config,
                          scoreCategories:
                            arr,
                        });
                      }}
                      className="
                      col-span-7
                      px-4 py-3
                      rounded-2xl
                      bg-white/10
                      border border-white/10
                      "
                      placeholder="Tên hiển thị"
                    />

                    {/* DELETE */}

                    <button
                      onClick={() =>
                        removeCategory(index)
                      }
                      className="
                      col-span-2
                      w-12 h-12
                      rounded-2xl
                      flex items-center justify-center
                      bg-red-500/10
                      border border-red-500/20
                      text-red-300
                      hover:bg-red-500/20
                      hover:scale-110
                      transition-all
                      "
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )
              )}
            </div>

            <button
              onClick={addCategory}
              className="
              mt-5
              px-5 py-3
              rounded-2xl
              bg-gradient-to-r from-green-500 to-emerald-500
              font-bold
              flex items-center gap-2
              hover:scale-105
              transition-all
              shadow-lg shadow-green-500/20
              "
            >
              <Plus size={18} />
              Thêm tiêu chí
            </button>
          </div>

          {/* SAVE */}

          <button
            onClick={saveConfig}
            disabled={loadingPage}
            className="
            px-6 py-4
            rounded-2xl
            font-bold
            flex items-center gap-2
            transition-all duration-300
            hover:scale-105
            hover:brightness-110
            shadow-lg shadow-emerald-500/20
            "
            style={{
              background:
                "linear-gradient(135deg,#059669,#10b981,#34d399)",
            }}
          >
            <Save size={18} />

            {loadingPage
              ? "Đang lưu..."
              : "Lưu cấu hình"}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}