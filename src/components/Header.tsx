"use client";

import React, { useState } from "react";
import { RagunanLogo } from "./RagunanLogo";
import Link from "next/link";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Lock,
  LogOut,
  Menu,
  X,
  Sliders,
} from "lucide-react";

export type NavTabType = "dashboard" | "officialSheet" | "survey" | "responses" | "manageQuestions";

interface HeaderProps {
  role?: "respondent" | "admin";
  currentTab?: NavTabType;
  onTabChange?: (tab: NavTabType) => void;
  totalResponses?: number;
  onLogoutAdmin?: () => void;
  onOpenAdminLogin?: () => void;
  onOpenPrintModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role = "respondent",
  currentTab = "survey",
  onTabChange,
  totalResponses = 0,
  onLogoutAdmin,
  onOpenAdminLogin,
  onOpenPrintModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectTab = (tab: NavTabType) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    setMobileMenuOpen(false);
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Sleek Modern Header */}
      <header className="app-header">
        <div className="header-container">
          {/* Brand & Emblem Logo */}
          <Link
            href={role === "admin" ? "/admin" : "/"}
            className="header-brand-link"
            title="Portal Survei Kepuasan Layanan UP Taman Margasatwa Ragunan"
          >
            <RagunanLogo size={46} showSubtitle={true} />
          </Link>

          {/* ADMIN VIEW: Modern Segmented Navigation Tabs */}
          {role === "admin" && (
            <nav className="nav-tabs desktop-only" aria-label="Navigasi Utama Panel Admin">
              <button
                type="button"
                className={`nav-tab-btn ${currentTab === "dashboard" ? "active" : ""}`}
                onClick={() => handleSelectTab("dashboard")}
                id="tab-btn-dashboard"
                title="Ringkasan Dashboard IKM Eksekutif"
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${currentTab === "officialSheet" ? "active" : ""}`}
                onClick={() => handleSelectTab("officialSheet")}
                id="tab-btn-official-sheet"
                title="Matriks Rekapitulasi Standar PermenPAN-RB"
              >
                <FileSpreadsheet size={15} />
                <span>Matriks IKM</span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${currentTab === "responses" ? "active" : ""}`}
                onClick={() => handleSelectTab("responses")}
                id="tab-btn-responses"
                title="Data Responden Pegawai"
              >
                <Users size={15} />
                <span>Responden</span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${currentTab === "manageQuestions" ? "active" : ""}`}
                onClick={() => handleSelectTab("manageQuestions")}
                id="tab-btn-manage-questions"
                title="Kelola Soal & Kode Rekening Program"
              >
                <Sliders size={15} />
                <span>Kelola Soal</span>
              </button>
            </nav>
          )}

          {/* Action Tools (Right) */}
          <div className="header-actions">
            {role === "respondent" ? (
              onOpenAdminLogin ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenAdminLogin}
                  id="btn-open-admin-portal"
                  title="Akses masuk untuk Pimpinan dan Tim Evaluasi Tata Usaha"
                >
                  <Lock size={14} color="#047857" />
                  <span className="btn-text-full">Akses Pimpinan / Admin</span>
                  <span className="btn-text-short">Admin</span>
                </button>
              ) : (
                <Link
                  href="/admin"
                  className="btn btn-secondary btn-sm"
                  id="btn-link-admin-portal"
                  title="Akses masuk untuk Pimpinan dan Tim Evaluasi Tata Usaha"
                >
                  <Lock size={14} color="#047857" />
                  <span className="btn-text-full">Akses Pimpinan / Admin</span>
                  <span className="btn-text-short">Admin</span>
                </Link>
              )
            ) : (
              <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {onLogoutAdmin && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onLogoutAdmin}
                    title="Keluar dari Portal Admin"
                    id="btn-logout-admin"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      fontWeight: 600,
                      color: "var(--slate-700)",
                    }}
                  >
                    <LogOut size={14} color="#64748b" />
                    <span>Keluar</span>
                  </button>
                )}
              </div>
            )}

            {/* Mobile Menu Trigger for Admin */}
            {role === "admin" && (
              <div className="mobile-only-header">
                <button
                  type="button"
                  className="mobile-menu-btn"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Buka Menu Navigasi"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Drawer Menu (Admin) */}
        {role === "admin" && mobileMenuOpen && (
          <div className="mobile-drawer">
            <div className="mobile-drawer-tabs">
              <button
                type="button"
                className={`mobile-tab-btn ${currentTab === "dashboard" ? "active" : ""}`}
                onClick={() => handleSelectTab("dashboard")}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard Eksekutif</span>
              </button>

              <button
                type="button"
                className={`mobile-tab-btn ${currentTab === "officialSheet" ? "active" : ""}`}
                onClick={() => handleSelectTab("officialSheet")}
              >
                <FileSpreadsheet size={18} />
                <span>Matriks Rekapitulasi IKM</span>
              </button>

              <button
                type="button"
                className={`mobile-tab-btn ${currentTab === "responses" ? "active" : ""}`}
                onClick={() => handleSelectTab("responses")}
              >
                <Users size={18} />
                <span>Data Responden</span>
              </button>

              <button
                type="button"
                className={`mobile-tab-btn ${currentTab === "manageQuestions" ? "active" : ""}`}
                onClick={() => handleSelectTab("manageQuestions")}
              >
                <Sliders size={18} />
                <span>Kelola Soal & Kode Program</span>
              </button>
            </div>

            <div className="mobile-drawer-actions">
              {onLogoutAdmin && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogoutAdmin();
                  }}
                >
                  <LogOut size={15} />
                  <span>Keluar dari Portal Admin</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
