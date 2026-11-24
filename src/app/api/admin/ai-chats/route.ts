import { NextResponse } from "next/server";
import { getAllAiChats, removeAiChat } from "@/lib/visitor-store";

export async function GET() {
  try {
    const chats = await getAllAiChats();
    return NextResponse.json({ success: true, chats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      await removeAiChat(id);
      return NextResponse.json({ success: true, message: "Deleted chat log" });
    }

    return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed" }, { status: 500 });
  }
}
