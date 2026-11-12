"use client";

import React from "react";
import { getOfficialHeaderDetails } from "@/lib/periodUtils";
import { PeriodFilterState } from "./PeriodCalendarPicker";

interface SurveyPageHeaderProps {
  currentPeriod?: PeriodFilterState;
  align?: "left" | "center";
  className?: string;
  compact?: boolean;
}

export const SurveyPageHeader: React.FC<SurveyPageHeaderProps> = ({
  currentPeriod,
  align = "left",
  className = "",
  compact = false,
}) => {
  const details = getOfficialHeaderDetails(currentPeriod);
  const isCentered = align === "center";

  return (
    <div
      className={`survey-page-header ${isCentered ? "text-center" : ""} ${
        compact ? "compact" : ""
      } ${className}`}
    >
      <h1 className="page-main-title">
        KUESIONER INDEKS KEPUASAN LAYANAN
      </h1>
      <p className="page-main-program">
        {details.programName}
      </p>
      <p className="page-main-subtitle">
        {details.periodLabel}
      </p>
    </div>
  );
};
