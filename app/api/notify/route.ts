import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, weather } = body;

  // In a real app this would send an email via Resend / SendGrid / etc.
  console.log(`[notify] Sending weather email to ${email}:`, weather);

  return NextResponse.json({ success: true, message: `Notification sent to ${email}` });
}
