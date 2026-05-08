"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
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
  Search,
} from "lucide-react";
import { signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/Authcontext";
import { TrungDoi } from "@/lib/types";

type ScoreCategory = {
  key: string;
  label: string;
};

type UserType = {
  id: string;
  email: string;
  role: string;
  username?: string;

  avatar?: string;

  online?: boolean;

  createdAt?: any;
};

type SystemConfig = {
  trungDois: TrungDoi[];

  scoreCategories: ScoreCategory[];

  tdColors: Record<string, string>;

  tdIcons: Record<string, string>;
};

export const DEFAULT_CONFIG: SystemConfig = {
trungDois: [
  {
    id: "td9",
    name: "Trung đội 9",
  },
  {
    id: "td10",
    name: "Trung đội 10",
  },
  {
    id: "td11",
    name: "Trung đội 11",
  },
  {
    id: "td12",
    name: "Trung đội 12",
  },
],
  scoreCategories: [
    { key: "nd1", label: "Nội dung I" },
    { key: "nd2", label: "Nội dung II" },
    { key: "nd3", label: "Nội dung III" },
    { key: "nd4", label: "Nội dung IV" },
  ],

  tdColors: {
    "td9": "#FF6B6B",
    "td10": "#34d399",
    "td11": "#38bdf8",
    "td12": "#fbbf24",
  },

  tdIcons: {
    "td9": "🔴",
    "td10": "🟢",
    "td11": "🔵",
    "td12": "🟡",
  },
};

export default function AdminPage() {
  // ================= CONFIG =================

  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);

  // ================= USERS =================

  const [users, setUsers] = useState<UserType[]>([]);

  // create user
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [loadingPage, setLoadingPage] = useState(false);
  const { user, loading, role } = useAuth();
  const [editingUsers, setEditingUsers] = useState<Record<string, string>>({});
  const [savingUser, setSavingUser] = useState("");

  // search
  const [search, setSearch] = useState("");

  // debounce
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // filter
  const [roleFilter, setRoleFilter] = useState("all");

  // sort
  const [sortOrder, setSortOrder] = useState("newest");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);

  const USERS_PER_PAGE = 5;

  // selected users
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // edit modal
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  // =================================================
  // DEBOUNCE SEARCH
  // =================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // =================================================
  // FIREBASE REALTIME
  // =================================================

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const arr: UserType[] = [];

      snapshot.forEach((d) => {
        arr.push({
          id: d.id,
          ...(d.data() as any),
        });
      });

      setUsers(arr);
    });

    return () => unsub();
  }, []);

  // =================================================
  // FILTER + SORT
  // =================================================

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const keyword = debouncedSearch.toLowerCase();

        const matchSearch =
          u.email?.toLowerCase().includes(keyword) ||
          u.username?.toLowerCase().includes(keyword);

        const matchRole = roleFilter === "all" ? true : u.role === roleFilter;

        return matchSearch && matchRole;
      })

      .sort((a: any, b: any) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;

        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        if (sortOrder === "newest") {
          return bTime - aTime;
        }

        return aTime - bTime;
      });
  }, [users, debouncedSearch, roleFilter, sortOrder]);

  // =================================================
  // PAGINATION
  // =================================================

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const startIndex = (currentPage - 1) * USERS_PER_PAGE;

  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE,
  );

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
    const snap = await getDoc(doc(db, "config", "system"));

    if (snap.exists()) {
      setConfig(snap.data() as SystemConfig);
    } else {
      await setDoc(doc(db, "config", "system"), DEFAULT_CONFIG);

      setConfig(DEFAULT_CONFIG);
    }
  }

  useEffect(() => {
    if (role !== "admin") return;

    const unsub = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const arr: UserType[] = [];

        snapshot.forEach((doc) => {
          arr.push({
            id: doc.id,
            ...(doc.data() as any),
          });
        });

        console.log(arr);

        setUsers(arr);
      },
      (error) => {
        console.error("Firebase error:", error);
      },
    );

    return () => unsub();
  }, [role]);

  useEffect(() => {
    if (role !== "admin") return;

    // loadUsers();
    loadConfig();
  }, [role]);

  // ================= SAVE CONFIG =================

  async function saveConfig() {
    setLoadingPage(true);

    try {
      await updateDoc(doc(db, "config", "system"), {
        trungDois: config.trungDois,

        scoreCategories: config.scoreCategories,

        tdColors: config.tdColors,

        tdIcons: config.tdIcons,
      });

      alert("✅ Đã lưu cấu hình");
    } catch (err) {
      console.error(err);

      alert("❌ Lỗi lưu cấu hình");
    }

    setLoadingPage(false);
  }

  // ================= TRUNG DOI =================

function addTrungDoi() {
  const id = crypto.randomUUID();

  setConfig((prev) => ({
    ...prev,

    trungDois: [
      ...prev.trungDois,
      {
        id,
        name: "Trung đội mới",
      },
    ],

    tdColors: {
      ...prev.tdColors,
      [id]: "#ffffff",
    },

    tdIcons: {
      ...prev.tdIcons,
      [id]: "⚪",
    },
  }));
}
  function removeTrungDoi(index: number) {
    const td = config.trungDois[index];

    const arr = config.trungDois.filter((_, i) => i !== index);

    const colors = {
      ...config.tdColors,
    };

    const icons = {
      ...config.tdIcons,
    };

    delete colors[td.id];
    delete icons[td.id];

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

  function removeCategory(index: number) {
    setConfig((prev) => ({
      ...prev,

      scoreCategories: prev.scoreCategories.filter((_, i) => i !== index),
    }));
  }

  // ================= USER =================

  async function createUser() {
    try {
      const res = await fetch("/api/create-user", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          username: newUsername,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert("✅ Đã tạo user");

      setNewEmail("");
      setNewPassword("");
      setNewUsername("");
    } catch (err) {
      console.error(err);

      alert("❌ Lỗi tạo user");
    }
  }

  async function updateUser(id: string, data: Partial<UserType>) {
    try {
      setSavingUser(id);

      await updateDoc(doc(db, "users", id), data);

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...data } : u)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSavingUser("");
    }
  }

  async function updateUserRole(id: string, role: string) {
    await updateDoc(doc(db, "users", id), {
      role,
    });

    // loadUsers();
  }

  async function deleteUser(id: string) {
    if (id === user?.uid) {
      alert("Không thể xóa chính mình");

      return;
    }

    if (!confirm("Xóa user này?")) return;

    await deleteDoc(doc(db, "users", id));
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

  async function bulkDeleteUsers() {
    if (!confirm("Xóa tất cả user đã chọn?")) return;

    for (const id of selectedUsers) {
      await deleteDoc(doc(db, "users", id));
    }

    setSelectedUsers([]);
  }

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
                background: "linear-gradient(135deg,#38bdf8,#818cf8,#f472b6)",
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

              <h2 className="text-3xl font-black">Cấu hình hệ thống</h2>
            </div>

            {/* ================= TRUNG DOI ================= */}

            <div className="mb-10">
              <div className="font-bold text-xl mb-4">Trung đội</div>

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
                      type="text"
                      value={td.name}
                      onChange={(e) => {
                        const arr = [...config.trungDois];

                        const oldTd = arr[index];

                        const newName = e.target.value;

                        arr[index] = {
                          ...oldTd,
                          name: newName,
                        };

                        setConfig({
                          ...config,
                          trungDois: arr,
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
                      value={config.tdColors?.[td.id] || "#ffffff"}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,

                          tdColors: {
                            ...prev.tdColors,

                            [td.id]: e.target.value,
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
                      value={config.tdIcons?.[td.id] || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,

                          tdIcons: {
                            ...prev.tdIcons,

                            [td.id]: e.target.value,
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
                        color: config.tdColors?.[td.id],
                      }}
                    >
                      {config.tdIcons?.[td.id]}{td.name}
                    </div>

                    {/* DELETE */}

                    <button
                      onClick={() => removeTrungDoi(index)}
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
              <div className="font-bold text-xl mb-4">Nội dung chấm điểm</div>

              <div className="space-y-4">
                {config.scoreCategories.map((cat, index) => (
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
                        const arr = [...config.scoreCategories];

                        arr[index].key = e.target.value;

                        setConfig({
                          ...config,
                          scoreCategories: arr,
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
                        const arr = [...config.scoreCategories];

                        arr[index].label = e.target.value;

                        setConfig({
                          ...config,
                          scoreCategories: arr,
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
                      onClick={() => removeCategory(index)}
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
                background: "linear-gradient(135deg,#059669,#10b981,#34d399)",
              }}
            >
              <Save size={18} />

              {loadingPage ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </div>
        </div>
        {/* ================= USERS MANAGEMENT ================= */}

        <div className="rounded-[32px] p-7 backdrop-blur-2xl border border-white/10 bg-white/[0.06] shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-cyan-300" />
            <h2 className="text-2xl font-bold">Quản lý tài khoản</h2>
          </div>

          {/* CREATE USER */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email"
              className="px-4 py-3 rounded-2xl bg-white/10 border border-white/10"
            />

            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Username"
              className="px-4 py-3 rounded-2xl bg-white/10 border border-white/10"
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password"
              className="px-4 py-3 rounded-2xl bg-white/10 border border-white/10"
            />

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-white/10 border border-white/10"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            onClick={createUser}
            className="mb-8 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 font-bold flex items-center gap-2"
          >
            <UserPlus size={18} />
            Tạo tài khoản
          </button>

          <div className="space-y-8">
            {/* ================================================= */}
            {/* STATS */}
            {/* ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* total */}
              <div className="rounded-3xl p-5 bg-white/5 border border-white/10">
                <div className="text-white/50 text-sm">Tổng user</div>

                <div className="text-4xl font-black mt-2">{users.length}</div>
              </div>

              {/* admin */}
              <div className="rounded-3xl p-5 bg-red-500/10 border border-red-500/20">
                <div className="text-red-300 text-sm">Admin</div>

                <div className="text-4xl font-black mt-2 text-red-300">
                  {users.filter((u) => u.role === "admin").length}
                </div>
              </div>

              {/* users */}
              <div className="rounded-3xl p-5 bg-cyan-500/10 border border-cyan-500/20">
                <div className="text-cyan-300 text-sm">Users</div>

                <div className="text-4xl font-black mt-2 text-cyan-300">
                  {users.filter((u) => u.role === "user").length}
                </div>
              </div>

              {/* online */}
              <div className="rounded-3xl p-5 bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-emerald-300 text-sm">Online</div>

                <div className="text-4xl font-black mt-2 text-emerald-300">
                  {users.filter((u) => u.online).length}
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* FILTER BAR */}
            {/* ================================================= */}

            <div className="flex flex-col xl:flex-row gap-4">
              {/* search */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="
            absolute left-4 top-1/2
            -translate-y-1/2
            text-white/40
            "
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm email hoặc username..."
                  className="
            w-full
            pl-12 pr-5 py-4
            rounded-2xl
            bg-white/10
            border border-white/10
            focus:outline-none
            focus:ring-2
            focus:ring-cyan-400/50
            "
                />
              </div>

              {/* role */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="
          px-5 py-4
          rounded-2xl
          bg-white/10
          border border-white/10
          "
              >
                <option value="all">Tất cả role</option>

                <option value="user">User</option>

                <option value="admin">Admin</option>
              </select>

              {/* sort */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="
          px-5 py-4
          rounded-2xl
          bg-white/10
          border border-white/10
          "
              >
                <option value="newest">Mới nhất</option>

                <option value="oldest">Cũ nhất</option>
              </select>

              {/* bulk delete */}
              <button
                onClick={bulkDeleteUsers}
                className="
          px-5 py-4
          rounded-2xl
          bg-red-500/10
          border border-red-500/20
          text-red-300
          hover:bg-red-500/20
          transition-all
          "
              >
                Xóa đã chọn
              </button>
            </div>

            {/* ================================================= */}
            {/* USERS */}
            {/* ================================================= */}

            <div className="space-y-4">
              {paginatedUsers.map((u) => (
                <div
                  key={u.id}
                  className="
            rounded-3xl
            bg-white/[0.05]
            border border-white/10
            p-5
            hover:bg-white/[0.08]
            transition-all
            "
                >
                  <div className="flex flex-col xl:flex-row gap-5 xl:items-center">
                    {/* checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers((prev) => [...prev, u.id]);
                        } else {
                          setSelectedUsers((prev) =>
                            prev.filter((id) => id !== u.id),
                          );
                        }
                      }}
                    />

                    {/* avatar */}
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                      className="
                w-16 h-16
                rounded-2xl
                border border-white/10
                "
                    />

                    {/* info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-black">{u.username}</div>

                        {u.role === "admin" && (
                          <div
                            className="
                      px-2 py-1
                      rounded-full
                      bg-red-500/10
                      border border-red-500/20
                      text-red-300
                      text-xs
                      "
                          >
                            ADMIN
                          </div>
                        )}
                      </div>

                      <div className="text-white/50">{u.email}</div>

                      <div
                        className={`
                  text-xs mt-2
                  ${u.online ? "text-emerald-300" : "text-white/40"}
                  `}
                      >
                        ● {u.online ? "Online" : "Offline"}
                      </div>
                    </div>

                    {/* username */}
                    <input
                      value={editingUsers[u.id] ?? u.username ?? ""}
                      onChange={(e) =>
                        setEditingUsers((prev) => ({
                          ...prev,
                          [u.id]: e.target.value,
                        }))
                      }
                      onBlur={() =>
                        updateUser(u.id, {
                          username: editingUsers[u.id],
                        })
                      }
                      className="
                px-4 py-3
                rounded-2xl
                bg-white/10
                border border-white/10
                "
                    />
                    {savingUser === u.id && (
                      <div className="text-xs text-cyan-300">Đang lưu...</div>
                    )}
                    {/* role */}
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value)}
                      className="
                px-4 py-3
                rounded-2xl
                bg-white/10
                border border-white/10
                "
                    >
                      <option value="user">User</option>

                      <option value="admin">Admin</option>
                    </select>

                    {/* edit */}
                    <button
                      onClick={() => setEditingUser(u)}
                      className="
                w-12 h-12
                rounded-2xl
                bg-cyan-500/10
                border border-cyan-500/20
                text-cyan-300
                flex items-center justify-center
                "
                    >
                      <Pencil size={18} />
                    </button>

                    {/* delete */}
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="
                w-12 h-12
                rounded-2xl
                bg-red-500/10
                border border-red-500/20
                text-red-300
                flex items-center justify-center
                "
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ================================================= */}
            {/* PAGINATION */}
            {/* ================================================= */}

            <div className="flex justify-center gap-3">
              {Array.from({
                length: totalPages,
              }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`
            w-11 h-11
            rounded-2xl
            font-bold
            ${currentPage === i + 1 ? "bg-cyan-500" : "bg-white/10"}
            `}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* ================================================= */}
            {/* EDIT MODAL */}
            {/* ================================================= */}

            {editingUser && (
              <div
                className="
          fixed inset-0
          bg-black/60
          backdrop-blur-sm
          flex items-center justify-center
          z-50
          "
              >
                <div
                  className="
            w-full max-w-md
            rounded-3xl
            bg-[#111827]
            border border-white/10
            p-6
            "
                >
                  <h2 className="text-2xl font-black mb-5">Chỉnh sửa user</h2>

                  <input
                    value={editingUser.username}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        username: e.target.value,
                      })
                    }
                    className="
              w-full
              px-4 py-3
              rounded-2xl
              bg-white/10
              border border-white/10
              mb-4
              "
                  />

                  <button
                    onClick={async () => {
                      await updateUser(editingUser.id, {
                        username: editingUser.username,
                      });

                      setEditingUser(null);
                    }}
                    className="
              w-full
              py-3
              rounded-2xl
              bg-cyan-500
              font-bold
              "
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
