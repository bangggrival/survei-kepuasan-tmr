"use client";

import React, { useEffect } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Trash2,
  RotateCcw,
  X,
  FileSpreadsheet,
} from "lucide-react";

export type ModalType = "danger" | "warning" | "info" | "success";

export interface UiConfirmModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  message: string;
  subMessage?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ModalType;
  isLoading?: boolean;
}

export const UiConfirmModal: React.FC<UiConfirmModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  subMessage,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  type = "warning",
  isLoading = false,
}) => {
  const handleClose = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        handleClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose, onCancel]);

  if (!isOpen) return null;

  const getTypeTheme = () => {
    switch (type) {
      case "danger":
        return {
          icon: <Trash2 size={24} color="#dc2626" />,
          bg: "#fef2f2",
          border: "#fecaca",
          badgeColor: "#dc2626",
          btnGradient: "linear-gradient(135deg, #ef4444, #dc2626)",
          btnShadow: "rgba(220, 38, 38, 0.35)",
        };
      case "warning":
        return {
          icon: <RotateCcw size={24} color="#d97706" />,
          bg: "#fffbeb",
          border: "#fde68a",
          badgeColor: "#d97706",
          btnGradient: "linear-gradient(135deg, #f59e0b, #d97706)",
          btnShadow: "rgba(217, 119, 6, 0.35)",
        };
      case "success":
        return {
          icon: <CheckCircle2 size={24} color="#059669" />,
          bg: "#f0fdf4",
          border: "#bbf7d0",
          badgeColor: "#059669",
          btnGradient: "linear-gradient(135deg, #10b981, #059669)",
          btnShadow: "rgba(5, 150, 105, 0.35)",
        };
      case "info":
      default:
        return {
          icon: <Info size={24} color="#059669" />,
          bg: "#f0fdf4",
          border: "#bbf7d0",
          badgeColor: "#059669",
          btnGradient: "linear-gradient(135deg, #059669, #047857)",
          btnShadow: "rgba(5, 150, 105, 0.35)",
        };
    }
  };

  const theme = getTypeTheme();

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 1200 }}
    >
      <div
        className="modal-dialog"
        style={{
          width: "92%",
          maxWidth: "460px",
          borderRadius: "18px",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(15, 23, 42, 0.06)",
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem 0.75rem 1.5rem",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: theme.bg,
                border: `1.5px solid ${theme.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {theme.icon}
            </div>
            <div>
              <h3 style={{ fontSize: "1.08rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                {title}
              </h3>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#64748b",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Konfirmasi Tindakan Sistem
              </span>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "0.75rem 1.5rem 1.25rem 1.5rem" }}>
          <p
            style={{
              fontSize: "0.88rem",
              color: "#334155",
              lineHeight: 1.55,
              margin: "0 0 0.5rem 0",
              fontWeight: 500,
            }}
          >
            {message}
          </p>

          {subMessage && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.65rem 0.85rem",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "0.76rem",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              <AlertCircle size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
              <span>{subMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div
          style={{
            padding: "1rem 1.5rem",
            background: "#f8fafc",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleClose}
            disabled={isLoading}
            style={{ minWidth: "80px", fontWeight: 600 }}
          >
            {cancelText}
          </button>

          {onConfirm && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                background: theme.btnGradient,
                color: "#ffffff",
                fontWeight: 700,
                border: "none",
                minWidth: "120px",
                boxShadow: `0 3px 10px ${theme.btnShadow}`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }}
            >
              <span>{isLoading ? "Memproses..." : confirmText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
