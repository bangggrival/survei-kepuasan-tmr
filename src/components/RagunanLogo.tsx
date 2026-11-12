import React from "react";
import Image from "next/image";

interface RagunanLogoProps {
  size?: number;
  showSubtitle?: boolean;
  variant?: "emblem" | "full";
}

export const RagunanLogo: React.FC<RagunanLogoProps> = ({
  size = 44,
  showSubtitle = true,
  variant = "emblem",
}) => {
  if (variant === "full") {
    const fullHeight = size;
    const fullWidth = Math.round(fullHeight * (1018 / 723));
    return (
      <div className="brand-section brand-full-logo" style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
        <Image
          src="/assets/ragunan-logo-full.png"
          alt="Logo Resmi Taman Margasatwa Ragunan Jakarta"
          width={fullWidth}
          height={fullHeight}
          priority
          style={{ height: fullHeight, width: "auto", objectFit: "contain" }}
        />
      </div>
    );
  }

  return (
    <div className="brand-section">
      <div
        className="brand-emblem-wrap"
        style={{
          maxWidth: size,
          maxHeight: size,
        }}
      >
        <Image
          src="/assets/ragunan-emblem-square.png"
          alt="Logo Resmi UP Taman Margasatwa Ragunan"
          width={size}
          height={size}
          priority
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      <div className="brand-info">
        <div className="brand-title-row">
          <span className="brand-title">TAMAN MARGASATWA RAGUNAN</span>
        </div>
        {showSubtitle && (
          <span
            className="brand-subtitle"
            title="Unit Pengelola Taman Margasatwa Ragunan • Dinas Pertamanan dan Hutan Kota DKI Jakarta"
          >
            Dinas Pertamanan dan Hutan Kota Prov. DKI Jakarta
          </span>
        )}
      </div>
    </div>
  );
};


