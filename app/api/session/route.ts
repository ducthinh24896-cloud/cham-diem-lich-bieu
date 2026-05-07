import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const token = body.token;

  const response = NextResponse.json({
    ok: true,
  });

  response.cookies.set(
    "admin-token",
    token,
    {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({
    ok: true,
  });

  response.cookies.set(
    "admin-token",
    "",
    {
      expires: new Date(0),
    }
  );

  return response;
}