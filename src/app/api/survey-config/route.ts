import { NextRequest, NextResponse } from "next/server";
import { getSurveyConfig, saveSurveyConfig, resetSurveyConfig } from "@/lib/db";
import { SurveySection } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/survey-config
 * Fetch current active survey sections (Kode Program & Pertanyaan)
 */
export async function GET() {
  try {
    const sections = await getSurveyConfig();
    return NextResponse.json({
      success: true,
      data: sections,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memuat konfigurasi kuesioner";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * POST /api/survey-config
 * Save or reset survey sections & questions
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "reset") {
      const defaultSections = await resetSurveyConfig();
      return NextResponse.json({
        success: true,
        message: "Konfigurasi kuesioner berhasil dikembalikan ke standar awal.",
        data: defaultSections,
      });
    }

    const sections = body.sections as SurveySection[];

    if (!Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { success: false, error: "Format data bagian program tidak valid." },
        { status: 400 }
      );
    }

    // Validate that each section has code, title, and questions
    for (const sec of sections) {
      if (!sec.id || !sec.code || !sec.title) {
        return NextResponse.json(
          { success: false, error: `Bagian "${sec.title || sec.id}" harus memiliki ID, Kode Program, dan Judul.` },
          { status: 400 }
        );
      }
      if (!Array.isArray(sec.questions) || sec.questions.length === 0) {
        return NextResponse.json(
          { success: false, error: `Bagian "${sec.title}" harus memiliki daftar pertanyaan.` },
          { status: 400 }
        );
      }
      for (const q of sec.questions) {
        if (!q.id || !q.text.trim()) {
          return NextResponse.json(
            { success: false, error: `Pertanyaan Q${q.num} pada bagian "${sec.title}" tidak boleh kosong.` },
            { status: 400 }
          );
        }
      }
    }

    await saveSurveyConfig(sections);

    return NextResponse.json({
      success: true,
      message: "Kode program dan narasi pertanyaan kuesioner berhasil disimpan!",
      data: sections,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menyimpan konfigurasi kuesioner";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
