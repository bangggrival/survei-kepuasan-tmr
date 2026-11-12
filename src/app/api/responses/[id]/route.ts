import { NextRequest, NextResponse } from "next/server";
import { deleteResponse, getAllResponses } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const all = await getAllResponses();
    const found = all.find(r => r.id === id);
    if (!found) {
      return NextResponse.json({ success: false, error: "Data responden tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: found });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteResponse(id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Gagal menghapus data atau data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: `Data ${id} berhasil dihapus dari database` });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
