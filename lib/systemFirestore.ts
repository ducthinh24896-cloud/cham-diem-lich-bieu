"use client";

import { db } from "./firebase";

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

import type { SystemConfig } from "./system";

const DEFAULT_CONFIG: SystemConfig = {
  trungDois: [9, 10, 11, 12],

  scoreCategories: [
    { key: "nd1", label: "Nội dung I" },
    { key: "nd2", label: "Nội dung II" },
    { key: "nd3", label: "Nội dung III" },
    { key: "nd4", label: "Nội dung IV" },
  ],
};

function configRef() {
  if (!db) return null;

  return doc(db, "config", "system");
}

/** LOAD */
export async function fetchSystemConfig(): Promise<SystemConfig> {
  const ref = configRef();

  if (!ref) return DEFAULT_CONFIG;

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }

  return snap.data() as SystemConfig;
}

/** SAVE */
export async function saveSystemConfig(
  config: SystemConfig
) {
  const ref = configRef();

  if (!ref) return;

  await setDoc(ref, config);
}

/** REALTIME */
export function subscribeSystemConfig(
  callback: (config: SystemConfig) => void
) {
  const ref = configRef();

  if (!ref) return () => {};

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    callback(snap.data() as SystemConfig);
  });
}