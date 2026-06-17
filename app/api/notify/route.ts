import { NextRequest, NextResponse } from "next/server";

function isValidEmail(value: string): boolean {
  // simple, pragmatic check: non-empty local part, @, non-empty domain with a dot
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, weather, forecast } = body;

  if (typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
  }

  // In a real app this would send an email via Resend / SendGrid / etc.
  if (forecast) {
    console.log(`[notify] Sending 7-day forecast email to ${email}:`, forecast);
    return NextResponse.json({ success: true, message: `Weekly forecast sent to ${email}` });
  }

  console.log(`[notify] Sending weather email to ${email}:`, weather);
  return NextResponse.json({ success: true, message: `Notification sent to ${email}` });
}
