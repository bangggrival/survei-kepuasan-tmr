"use client";

import React from "react";
import { SectionRecapGroup } from "@/lib/officialRecap";
import {
  Printer,
  X,
  FileSpreadsheet,
  Zap,
  Fuel,
  Truck,
  Building2,
  ChevronRight,
  ShieldCheck,
  Award,
} from "lucide-react";

interface PrintSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: SectionRecapGroup[];
  onPrint: (sectionId: string) => void;
  onPreview?: (sectionId: string) => void;
  periodLabel?: string;
  overallIKM?: number;
}

export const PrintSelectorModal: React.FC<PrintSelectorModalProps> = ({
  isOpen,
  onClose,
  sections,
  onPrint,
  onPreview,
  periodLabel = "Triwulan I",
  overallIKM = 0,
}) => {
  if (!isOpen) return null;

  const getSectionIcon = (id: string) => {
    switch (id) {
      case "sec_1":
        return <Zap size={18} color="var(--gov-primary-600)" />;
      case "sec_2":
        return <Fuel size={18} color="#d97706" />;
      case "sec_3":
        return <Truck size={18} color="#2563eb" />;
      case "sec_4":
      default:
        return <Building2 size={18} color="#7c3aed" />;
    }
  };

  return (
    <div
      className="modal-backdrop no-print"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "620px",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          animation: "popScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, #047857 0%, #065f46 100%)",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Printer size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>
                Cetak Dokumen PDF IKM Resmi
              </h3>
              <p style={{ margin: 0, fontSize: "0.76rem", opacity: 0.9, marginTop: "2px" }}>
                Pilih format cetak rekapitulasi gabungan atau khusus per kode program
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "1.25rem 1.5rem", maxHeight: "75vh", overflowY: "auto" }}>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.85rem" }}>
            Dokumen dicetak rapi pada kertas standar <strong>A4 Landscape</strong> ber-KOP resmi UP Taman Margasatwa Ragunan, lengkap dengan tanda tangan pengesahan pimpinan.
          </div>

          {/* Option 1: Cetak Seluruh Kode Program (Gabungan) */}
          <div
            onClick={() => onPrint("all")}
            style={{
              background: "linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)",
              border: "1.5px solid #99f6e4",
              borderRadius: "12px",
              padding: "1rem 1.15rem",
              marginBottom: "1rem",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              transition: "all 0.2s ease",
            }}
            className="print-opt-card"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "var(--gov-primary-600)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--gov-primary-800)" }}>
                    Cetak Seluruh Kode Program (Lengkap 4 Bidang)
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      background: "#d1fae5",
                      color: "#065f46",
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    Format Utama
                  </span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: "2px" }}>
                  Matriks resmi PermenPAN-RB No. 14 / 2017 mencakup seluruh 20 butir indikator + Nilai Grand Total IKM {overallIKM.toFixed(1)} / 100.
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{
                flexShrink: 0,
                background: "var(--gov-primary-700)",
                borderColor: "var(--gov-primary-800)",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <Printer size={14} />
              <span>Cetak PDF</span>
            </button>
          </div>

          {/* Section Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: "1rem 0 0.85rem 0",
            }}
          >
            <div style={{ height: "1px", background: "#e2e8f0", flex: 1 }} />
            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Atau Cetak Khusus Per Kode Program
            </span>
            <div style={{ height: "1px", background: "#e2e8f0", flex: 1 }} />
          </div>

          {/* List Per Kode Program (4 Seksi) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {sections.map((sec, idx) => {
              return (
                <div
                  key={sec.id}
                  onClick={() => onPrint(sec.id)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.75rem",
                    transition: "all 0.15s ease",
                  }}
                  className="print-opt-item"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "8px",
                        background: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {getSectionIcon(sec.id)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--gov-primary-700)" }}>
                          {sec.code}
                        </span>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "4px",
                            background: sec.ikmDimensi >= 88.31 ? "#d1fae5" : "#dbeafe",
                            color: sec.ikmDimensi >= 88.31 ? "#065f46" : "#1e40af",
                          }}
                        >
                          IKM {sec.ikmDimensi.toFixed(1)} • Mutu {sec.mutuPredikat}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "#1e293b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginTop: "1px",
                        }}
                        title={sec.title}
                      >
                        {sec.shortTitle || sec.title}
                      </div>
                    </div>
                  </div>

                  <div className="print-opt-actions" style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                    {onPreview && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(sec.id);
                        }}
                        style={{ padding: "0.35rem 0.65rem", fontSize: "0.72rem" }}
                        title="Buka pratinjau di layar"
                      >
                        <span>Pratinjau</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        color: "#0f766e",
                        borderColor: "#ccfbf1",
                        background: "#f0fdfa",
                      }}
                      title={`Cetak dokumen PDF khusus kode ${sec.code}`}
                    >
                      <Printer size={13} />
                      <span>Cetak PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "0.85rem 1.5rem",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "#64748b" }}>
            <ShieldCheck size={13} color="#16a34a" />
            <span>Dokumen Cetak Sah Terakreditasi PermenPAN-RB No. 14 / 2017</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
