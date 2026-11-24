import { NextResponse } from "next/server";
import { getAllVisitors, removeVisitor, removeAllVisitors } from "@/lib/visitor-store";

export async function GET() {
  try {
    const visitors = await getAllVisitors();
    return NextResponse.json({ success: true, visitors });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {
      await removeAllVisitors();
      return NextResponse.json({ success: true, message: "Cleared all visitors" });
    }

    if (id) {
      await removeVisitor(id);
      return NextResponse.json({ success: true, message: "Deleted visitor" });
    }

    return NextResponse.json({ success: false, error: "Missing id or clearAll" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed" }, { status: 500 });
  }
}
