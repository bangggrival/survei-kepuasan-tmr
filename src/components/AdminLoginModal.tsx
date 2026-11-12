"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lock, Eye, EyeOff, ShieldCheck, X, ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    const cleanPin = pin.trim().toLowerCase();

    // Accepted PIN for admin/leadership
    if (cleanPin === "tmr1864" || cleanPin === "1864") {
      try {
        sessionStorage.setItem("tmr_admin_auth", "true");
        sessionStorage.setItem("tmr_admin_auth_time", new Date().toISOString());
      } catch (err) {
        console.error("Storage error:", err);
      }

      setIsVerifying(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin");
      }
      onClose();
    } else {
      setIsVerifying(false);
      setError("PIN / Kata Sandi salah. Silakan periksa kembali.");
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div
        className="modal-dialog"
        style={{
          width: "92%",
          maxWidth: "420px",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.35)",
        }}
      >
        <div className="modal-header" style={{ padding: "1.25rem 1.5rem 0.75rem 1.5rem", borderBottom: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16a34a",
              }}
            >
              <Lock size={18} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                Otorisasi Akses Pimpinan
              </h3>
              <p style={{ fontSize: "0.72rem", color: "#64748b", margin: 0 }}>
                Unit Pengelola Taman Margasatwa Ragunan
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleVerify}>
          <div className="modal-body" style={{ padding: "1rem 1.5rem" }}>
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <Image
                src="/assets/ragunan-emblem-square.png"
                alt="Emblem Ragunan"
                width={56}
                height={56}
                style={{ objectFit: "contain", margin: "0 auto 0.75rem auto" }}
              />
              <p style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.4 }}>
                Halaman ini khusus untuk Pimpinan dan Tim Evaluasi Tata Usaha dalam meninjau dashboard IKM dan rekapitulasi data.
              </p>
            </div>

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.75rem",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  color: "#b91c1c",
                  fontSize: "0.78rem",
                  marginBottom: "1rem",
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginBottom: "1.25rem" }}>
              <label
                htmlFor="admin-pin-input"
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "0.4rem",
                }}
              >
                PIN / Kata Sandi Pengelola:
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="admin-pin-input"
                  type={showPassword ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Masukkan PIN Admin"
                  autoFocus
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 2.5rem 0.75rem 0.85rem",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "0.95rem",
                    fontFamily: "inherit",
                    letterSpacing: showPassword ? "0.05em" : "0.2em",
                    outline: "none",
                    transition: "all 0.15s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gov-primary-600)")}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ marginTop: "0.45rem" }}>
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                  Akses khusus Pimpinan dan Tim Evaluasi Tata Usaha
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="btn btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "0.75rem 1rem",
                fontSize: "0.9rem",
                borderRadius: "10px",
              }}
            >
              <span>{isVerifying ? "Memverifikasi..." : "Masuk ke Dashboard Eksekutif"}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div
            className="modal-footer"
            style={{
              padding: "0.75rem 1.5rem 1.25rem 1.5rem",
              background: "#f8fafc",
              borderTop: "1px solid #f1f5f9",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Kembali ke Formulir Survei
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
