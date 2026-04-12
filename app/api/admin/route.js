import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(request) {
  try {
    const { password } = await request.json();
    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json({ success: false, error: "Yanlış şifre" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
  }
}
