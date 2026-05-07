"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { User, onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";

import * as AuthService from "./auth";

type Role = "admin" | "user" | null;

interface AuthCtx {
  user: User | null;
  role: Role;
  loading: boolean;

  login: typeof AuthService.login;
  register: typeof AuthService.register;
  loginWithName: typeof AuthService.loginWithName;
  logout: typeof AuthService.logout;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [role, setRole] =
    useState<Role>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub =
      onAuthStateChanged(
        auth,
        async (u) => {
          setUser(u);

          // chưa login
          if (!u) {
            setRole(null);
            setLoading(false);
            return;
          }

          try {
            // 🔥 LẤY CUSTOM CLAIMS
            const token =
              await u.getIdTokenResult(
                true
              );

            if (token.claims.admin) {
              setRole("admin");
            } else {
              setRole("user");
            }
          } catch (err) {
            console.error(
              "Lỗi claims:",
              err
            );

            setRole("user");
          }

          setLoading(false);
        }
      );

    return () => unsub();
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        role,
        loading,

        login: AuthService.login,
        register:
          AuthService.register,
        loginWithName:
          AuthService.loginWithName,
        logout:
          AuthService.logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}