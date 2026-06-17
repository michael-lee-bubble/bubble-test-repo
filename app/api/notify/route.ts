import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, weather, forecast } = body;

  // In a real app this would send an email via Resend / SendGrid / etc.
  if (forecast) {
    console.log(`[notify] Sending 7-day forecast email to ${email}:`, forecast);
    return NextResponse.json({ success: true, message: `Weekly forecast sent to ${email}` });
  }

  console.log(`[notify] Sending weather email to ${email}:`, weather);
  return NextResponse.json({ success: true, message: `Notification sent to ${email}` });
}
