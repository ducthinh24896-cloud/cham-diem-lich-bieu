import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function checkAdmin(
  uid: string
) {
  const snap = await getDoc(
    doc(db, "users", uid)
  );

  if (!snap.exists()) {
    return false;
  }

  return snap.data().role === "admin";
}