import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing email fields" },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: "Zamine Shipping <notifications@zamineshipping.com>",
      to,
      subject,
      html,
      replyTo: "support@zamineshipping.com",
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email error:", error);

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}