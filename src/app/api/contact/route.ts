import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    // Email to you
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="padding:12px;background:#f8fafc;border-radius:8px;white-space:pre-line;">
            ${message}
          </div>
        </div>
      `,
    });

    // Auto-reply to sender
    await transporter.sendMail({
      from: `"Danish" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Thanks for contacting me",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Thank you for reaching out, ${name}!</h2>
          <p>I received your message and will reply as soon as possible.</p>
          <p><strong>Your subject:</strong> ${subject}</p>
          <p><strong>Your message:</strong></p>
          <div style="padding:12px;background:#f8fafc;border-radius:8px;white-space:pre-line;">
            ${message}
          </div>
          <p style="margin-top:20px;">Best regards,<br/>Danish</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to send email." },
      { status: 500 }
    );
  }
}