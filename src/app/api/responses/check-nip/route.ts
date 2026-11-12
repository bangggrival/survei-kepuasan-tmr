import { NextRequest, NextResponse } from "next/server";
import { findDuplicateResponse } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nip = searchParams.get("nip") || "";
    const nama = searchParams.get("nama") || "";

    if (!nip.trim() && !nama.trim()) {
      return NextResponse.json({ exists: false });
    }

    const check = await findDuplicateResponse(nip.trim(), nama.trim());

    if (check.isDuplicate && check.existing) {
      const submitDate = new Date(check.existing.timestamp).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return NextResponse.json({
        exists: true,
        matchType: check.matchType,
        message: check.message,
        existingId: check.existing.id,
        nama: check.existing.nama,
        nip: check.existing.nip,
        period: check.periodLabel,
        quarter: check.quarterLabel,
        year: check.year,
        timestamp: check.existing.timestamp,
        submitDateFormatted: submitDate,
      });
    }

    return NextResponse.json({
      exists: false,
      period: check.periodLabel,
      quarter: check.quarterLabel,
      year: check.year,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ exists: false, error: err }, { status: 500 });
  }
}
