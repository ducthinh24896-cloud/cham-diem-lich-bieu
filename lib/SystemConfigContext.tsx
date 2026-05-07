"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { doc, onSnapshot } from "firebase/firestore";

import { db } from "./firebase";

import {
  DEFAULT_CONFIG,
  SystemConfig,
} from "./types";

const Context =
  createContext<SystemConfig>(
    DEFAULT_CONFIG
  );

export function SystemConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] =
    useState<SystemConfig>(
      DEFAULT_CONFIG
    );

  useEffect(() => {
    if (!db) return;

    const ref = doc(
      db,
      "config",
      "system"
    );

    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setConfig(
          snap.data() as SystemConfig
        );
      }
    });
  }, []);

  return (
    <Context.Provider value={config}>
      {children}
    </Context.Provider>
  );
}

export function useSystemConfig() {
  return useContext(Context);
}