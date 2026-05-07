"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  SystemConfig,
} from "./system";

import {
  subscribeSystemConfig,
} from "./systemFirestore";

interface SystemCtx {
  config: SystemConfig | null;
}

const Ctx = createContext<SystemCtx>({
  config: null,
});

export function SystemProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] =
    useState<SystemConfig | null>(null);

  useEffect(() => {
    const unsub =
      subscribeSystemConfig((cfg) => {
        setConfig(cfg);
      });

    return () => unsub();
  }, []);

  return (
    <Ctx.Provider value={{ config }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSystem() {
  return useContext(Ctx);
}