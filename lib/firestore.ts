/**
 * Firestore data layer
 * Collection: users/{uid}/entries/{dateKey}
 * dateKey format: "YYYY-MM-DD"
 */
import {
  doc, getDoc, getDocs, setDoc, deleteDoc,
  collection, query, where, orderBy,
  onSnapshot, Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { DayEntry, CalendarData } from "./types";

function entryRef(uid: string, dateKey: string) {
  return doc(db, "users", uid, "entries", dateKey);
}

function entriesCol(uid: string) {
  return collection(db, "users", uid, "entries");
}

/** Lưu / cập nhật một ngày */
export async function saveEntry(uid: string, dateKey: string, entry: DayEntry): Promise<void> {
  await setDoc(entryRef(uid, dateKey), { ...entry, updatedAt: new Date().toISOString() });
}

/** Xóa một ngày */
export async function deleteEntry(uid: string, dateKey: string): Promise<void> {
  await deleteDoc(entryRef(uid, dateKey));
}

/** Lấy toàn bộ entries của user (dùng lần đầu) */
export async function fetchAllEntries(uid: string): Promise<CalendarData> {
  const snap = await getDocs(entriesCol(uid));
  const data: CalendarData = {};
  snap.forEach((d) => { data[d.id] = d.data() as DayEntry; });
  return data;
}

/** Lắng nghe realtime thay đổi trong một tháng cụ thể */
export function subscribeToMonth(
  uid: string,
  year: number,
  month: number,
  callback: (entries: CalendarData) => void
): Unsubscribe {
  const prefix     = `${year}-${String(month + 1).padStart(2, "0")}`;
  const prefixEnd  = prefix + "\uf8ff";
  const q = query(
    entriesCol(uid),
    where("__name__", ">=", prefix),
    where("__name__", "<=", prefixEnd),
    orderBy("__name__")
  );
  return onSnapshot(q, (snap) => {
    const data: CalendarData = {};
    snap.forEach((d) => { data[d.id] = d.data() as DayEntry; });
    callback(data);
  });
}