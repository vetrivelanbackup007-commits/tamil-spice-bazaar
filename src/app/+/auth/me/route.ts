import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { verifyToken } from "@/server/auth";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("tsb_token")?.value;
  if (!cookie) return NextResponse.json({ user: null }, { status: 200 });
  const payload = verifyToken(cookie);
  if (!payload) return NextResponse.json({ user: null }, { status: 200 });
  const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, name: true, email: true, role: true } });
  return NextResponse.json({ user });
}
