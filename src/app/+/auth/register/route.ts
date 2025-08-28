import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Email/password registration is disabled. Please sign in with Google." },
    { status: 501 }
  );
}
