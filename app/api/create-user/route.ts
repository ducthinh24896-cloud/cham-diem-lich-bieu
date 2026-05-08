import { NextResponse }
from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebaseAdmin";

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const {
      email,
      password,
      username,
      role,
    } = body;

    // CREATE AUTH USER
    const user =
      await adminAuth.createUser({
        email,
        password,
      });

    // SAVE FIRESTORE
    await adminDb
      .collection("users")
      .doc(user.uid)
      .set({
        email,
        username,
        role,

        status: "active",

        avatar:
          `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,

        createdAt:
          new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}