import { NextRequest, NextResponse } from "next/server";
import { getAllResponses, createResponse, clearAllResponses, deleteResponse, findDuplicateResponse, findResponseByNip, getSurveyConfig } from "@/lib/db";
import { ALL_QUESTIONS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jabatan = searchParams.get("jabatan") || "all";
    const search = searchParams.get("search") || "";

    const responses = await getAllResponses({ jabatan, search });
    return NextResponse.json({
      success: true,
      total: responses.length,
      data: responses,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, nip, jabatan, saran, answers } = body;

    // Basic Validation
    if (!nama || !nama.trim()) {
      return NextResponse.json({ success: false, error: "Nama lengkap wajib diisi" }, { status: 400 });
    }
    if (!nip || !nip.trim()) {
      return NextResponse.json({ success: false, error: "NIP / NRK wajib diisi" }, { status: 400 });
    }
    if (!jabatan) {
      return NextResponse.json({ success: false, error: "Jabatan wajib dipilih" }, { status: 400 });
    }
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ success: false, error: "Jawaban survei tidak valid" }, { status: 400 });
    }

    // Check duplicate Nama Lengkap + NIP/NRK submission for active period (Opsi A)
    const duplicateCheck = await findDuplicateResponse(nip.trim(), nama.trim());
    if (duplicateCheck.isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          error: duplicateCheck.message,
          code: "DUPLICATE_SUBMISSION",
          matchType: duplicateCheck.matchType,
          existingId: duplicateCheck.existing?.id,
          period: duplicateCheck.periodLabel,
          quarter: duplicateCheck.quarterLabel,
          year: duplicateCheck.year,
        },
        { status: 409 }
      );
    }

    // Verify all active indicator questions are present and within range 1-4
    let activeQuestions = ALL_QUESTIONS;
    try {
      const activeConfig = await getSurveyConfig();
      if (Array.isArray(activeConfig) && activeConfig.length > 0) {
        activeQuestions = activeConfig.flatMap((s) => s.questions.map((q) => ({
          ...q,
          sectionId: s.id,
          sectionTitle: s.title,
          sectionShortTitle: s.shortTitle || s.title,
        })));
      }
    } catch {
      // fallback to ALL_QUESTIONS
    }

    for (const q of activeQuestions) {
      const val = answers[q.id];
      if (typeof val !== "number" || val < 1 || val > 4) {
        return NextResponse.json(
          { success: false, error: `Pertanyaan nomor Q${q.num} (${q.id}) belum diisi secara valid (skala 1-4)` },
          { status: 400 }
        );
      }
    }

    const created = await createResponse({
      nama: nama.trim(),
      nip: nip.trim(),
      jabatan,
      saran: saran ? saran.trim() : "",
      answers,
    });

    return NextResponse.json({
      success: true,
      message: "Data kuesioner berhasil disimpan ke database",
      data: created,
    }, { status: 201 });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const ok = await deleteResponse(id);
      return NextResponse.json({
        success: ok,
        message: ok ? `Data responden ID ${id} berhasil dihapus.` : `Data responden ID ${id} tidak ditemukan.`,
      });
    }

    await clearAllResponses();
    return NextResponse.json({
      success: true,
      message: "Seluruh data pengisi kuesioner berhasil dikosongkan.",
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
}
