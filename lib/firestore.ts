"use client";

import { db } from "./firebase";
import {
  doc,
  collection,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

import type { DayEntry, CalendarData } from "./types";

// ✅ helper an toàn
function getDB() {
  if (!db) {
    console.warn("⚠️ Firestore chưa sẵn sàng");
    return null;
  }
  return db;
}

// ref
function entryRef(uid: string, dateKey: string) {
  const _db = getDB();
  if (!_db) return null;
  return doc(_db, "users", uid, "entries", dateKey);
}

function entriesCol(uid: string) {
  const _db = getDB();
  if (!_db) return null;
  return collection(_db, "users", uid, "entries");
}

/** Lưu / cập nhật */
export async function saveEntry(
  uid: string,
  dateKey: string,
  entry: DayEntry
) {
  const ref = entryRef(
    uid,
    dateKey
  );

  if (!ref) return;

  const now =
    new Date().toISOString();

  await setDoc(
    ref,
    {
      ...entry,

      createdAt:
        entry.createdAt ??
        now,

      updatedAt: now,
    },
    {
      merge: true,
    }
  );
}

/** Xóa */
export async function deleteEntry(uid: string, dateKey: string) {
  const ref = entryRef(uid, dateKey);
  if (!ref) return;

  await deleteDoc(ref);
}

/** Lấy toàn bộ */
export async function fetchAllEntries(uid: string): Promise<CalendarData> {
  const col = entriesCol(uid);
  if (!col) return {};

  const snap = await getDocs(col);
  const data: CalendarData = {};

  snap.forEach((d) => {
    data[d.id] = d.data() as DayEntry;
  });

  return data;
}

/** Realtime theo tháng */
export function subscribeToMonth(
  uid: string,
  year: number,
  month: number,
  callback: (entries: CalendarData) => void
): Unsubscribe {
  const col = entriesCol(uid);
  if (!col) return () => {}; // ✅ tránh crash

  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const prefixEnd = prefix + "\uf8ff";

  const q = query(
    col,
    where("__name__", ">=", prefix),
    where("__name__", "<=", prefixEnd),
    orderBy("__name__")
  );

 return onSnapshot(
  q,
  (snap) => {
    const data: CalendarData = {};

    snap.forEach((d) => {
      data[d.id] = d.data() as DayEntry;
    });

    callback(data);
  },

  (err) => {
    console.error("FIRESTORE ERROR:", err);
  }
);
}