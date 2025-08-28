import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Email/password login is disabled. Please use Google Sign-In." },
    { status: 501 }
  );
}
