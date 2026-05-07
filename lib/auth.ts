"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type Role = "admin" | "user";

export async function login(email: string, password: string) {
  const res = await signInWithEmailAndPassword(auth, email, password);
   console.log("USER:", res.user);
  console.log("UID:", res.user.uid);

  const snap = await getDoc(doc(db, "users", res.user.uid));

  if (!snap.exists()) {
    throw new Error("User chưa có role!");
  }

  return {
    user: res.user,
    role: snap.data().role as Role,
  };
}

export async function register(email: string, password: string) {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", res.user.uid), {
    email,
    role: "user",
  });

  return res.user;
}

export async function loginWithName(name: string) {
  const res = await signInAnonymously(auth);

  await updateProfile(res.user, {
    displayName: name,
  });

  await setDoc(doc(db, "users", res.user.uid), {
    name,
    role: "user",
  });

  return res.user;
}

export async function logout() {
  await signOut(auth);
}