"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  RotateCcw,
} from "lucide-react";
import {
  getCurrentPeriodInfo,
  getDynamicPeriodPresets,
  PeriodPreset,
} from "@/lib/periodUtils";

export interface PeriodFilterState {
  label: string;
  quarter: string;
  startDate?: string;
  endDate?: string;
}

interface PeriodCalendarPickerProps {
  currentPeriod: PeriodFilterState;
  onPeriodChange: (period: PeriodFilterState) => void;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const WEEKDAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export const PeriodCalendarPicker: React.FC<PeriodCalendarPickerProps> = ({
  currentPeriod,
  onPeriodChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();

  // Active view date in calendar
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());
  const [viewYear, setViewYear] = useState(() => today.getFullYear());

  // Available fiscal years for fast selector
  const availableYears = useMemo(() => {
    return [todayYear - 2, todayYear - 1, todayYear, todayYear + 1];
  }, [todayYear]);

  // Synchronize viewMonth and viewYear when opening dropdown
  useEffect(() => {
    if (isOpen) {
      if (currentPeriod?.startDate) {
        const parts = currentPeriod.startDate.split("-");
        if (parts.length >= 2) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          if (!isNaN(y) && !isNaN(m)) {
            setViewYear(y);
            setViewMonth(m);
            return;
          }
        }
      }
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
  }, [isOpen, currentPeriod]);

  // Dynamic presets based on viewYear
  const dynamicPresets = useMemo(() => {
    return getDynamicPeriodPresets(viewYear);
  }, [viewYear]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate calendar days for viewMonth & viewYear (Monday-aligned: 0 is Monday, 6 is Sunday)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // 0 is Monday

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Handle single date selection
  const handleSelectDay = (day: number) => {
    const formattedDate = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onPeriodChange({
      label: `${day} ${MONTH_NAMES[viewMonth]} ${viewYear}`,
      quarter: "Harian",
      startDate: formattedDate,
      endDate: formattedDate,
    });
    setIsOpen(false);
  };

  // Handle preset selection
  const handleSelectPreset = (p: PeriodPreset) => {
    onPeriodChange({
      label: p.label,
      quarter: p.quarter,
      startDate: p.startDate,
      endDate: p.endDate,
    });
    setIsOpen(false);
  };

  // Reset to today
  const handleSelectToday = () => {
    const d = today.getDate();
    const m = today.getMonth();
    const y = today.getFullYear();
    const formattedDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    onPeriodChange({
      label: `${d} ${MONTH_NAMES[m]} ${y}`,
      quarter: "Harian",
      startDate: formattedDate,
      endDate: formattedDate,
    });
    setViewYear(y);
    setViewMonth(m);
    setIsOpen(false);
  };

  // Reset to current official quarter
  const handleResetToCurrentQuarter = () => {
    const current = getCurrentPeriodInfo();
    onPeriodChange({
      label: current.pickerLabel,
      quarter: current.quarterCode,
      startDate: current.startDate,
      endDate: current.endDate,
    });
    setViewYear(current.year);
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  return (
    <div
      className="period-picker-container"
      ref={containerRef}
      style={{ position: "relative" }}
    >
      {/* Sleek Trigger Button */}
      <button
        type="button"
        className="period-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Klik untuk memilih periode atau tanggal evaluasi"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.45rem 0.85rem",
          background: "#ffffff",
          border: isOpen
            ? "1.5px solid var(--gov-primary-600)"
            : "1.5px solid var(--border-color)",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <CalendarDays size={16} color="var(--gov-primary-700)" />
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
            Periode:
          </span>
          <strong style={{ fontSize: "0.82rem", color: "#0f172a", fontWeight: 700 }}>
            {currentPeriod?.label || getCurrentPeriodInfo().pickerLabel}
          </strong>
        </div>
        <ChevronDown
          size={14}
          color="#64748b"
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.15s ease",
          }}
        />
      </button>

      {/* Popover Two-Column Calendar Dropdown */}
      {isOpen && (
        <div className="period-picker-dropdown">
          {/* Column 1: Presets & Year Selector */}
          <div className="period-presets-column">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.45rem",
                paddingBottom: "0.35rem",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Tahun Anggaran
              </span>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="select-filter"
                style={{
                  fontSize: "0.76rem",
                  fontWeight: 800,
                  padding: "3px 22px 3px 8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  background: "#ffffff",
                  color: "var(--gov-primary-800)",
                  cursor: "pointer",
                }}
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    TA {yr}
                  </option>
                ))}
              </select>
            </div>

            <div className="period-presets-list">
              {dynamicPresets.map((p) => {
                const isSelected =
                  currentPeriod.quarter === p.quarter &&
                  currentPeriod.startDate === p.startDate;

                return (
                  <button
                    key={p.quarter}
                    type="button"
                    className={`period-preset-btn ${isSelected ? "active" : ""}`}
                    onClick={() => handleSelectPreset(p)}
                  >
                    <span>{p.label}</span>
                    {isSelected && <Check size={14} color="var(--gov-primary-700)" />}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: "auto",
                paddingTop: "0.6rem",
                borderTop: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
              }}
            >
              <button
                type="button"
                className="period-preset-btn"
                onClick={handleResetToCurrentQuarter}
                style={{ fontSize: "0.74rem", color: "var(--gov-primary-700)" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <RotateCcw size={12} />
                  <span>Triwulan Berjalan</span>
                </span>
              </button>
            </div>
          </div>

          {/* Column 2: Interactive Month Calendar */}
          <div className="period-calendar-column">
            {/* Calendar Nav Header */}
            <div className="calendar-header">
              <button
                type="button"
                className="calendar-nav-btn"
                onClick={handlePrevMonth}
                title="Bulan Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="calendar-month-title">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                className="calendar-nav-btn"
                onClick={handleNextMonth}
                title="Bulan Berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekdays Row */}
            <div className="calendar-weekdays">
              {WEEKDAY_NAMES.map((name) => (
                <span key={name} className="calendar-weekday">
                  {name}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="calendar-days-grid">
              {daysArray.map((day, idx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="calendar-day-btn empty"
                    />
                  );
                }

                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isToday =
                  day === today.getDate() &&
                  viewMonth === today.getMonth() &&
                  viewYear === today.getFullYear();
                const isSelected =
                  currentPeriod.startDate === dateStr &&
                  currentPeriod.endDate === dateStr;
                const isInRange =
                  Boolean(
                    currentPeriod.startDate &&
                    currentPeriod.endDate &&
                    currentPeriod.startDate !== currentPeriod.endDate &&
                    dateStr >= currentPeriod.startDate &&
                    dateStr <= currentPeriod.endDate
                  );

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    className={`calendar-day-btn ${isSelected ? "selected" : ""} ${
                      isInRange ? "in-range" : ""
                    } ${isToday ? "today" : ""}`}
                    onClick={() => handleSelectDay(day)}
                    title={
                      isToday
                        ? `Hari ini: ${day} ${MONTH_NAMES[viewMonth]} ${viewYear}`
                        : `${day} ${MONTH_NAMES[viewMonth]} ${viewYear}`
                    }
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Bottom Quick Action: Hari Ini */}
            <div
              style={{
                marginTop: "0.85rem",
                paddingTop: "0.6rem",
                borderTop: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={handleSelectToday}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--gov-primary-700)",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: 0,
                }}
              >
                <span>Pilih Hari Ini ({today.getDate()} {MONTH_NAMES[today.getMonth()]})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--slate-500)",
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
