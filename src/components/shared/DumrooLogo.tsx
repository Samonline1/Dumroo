import React from "react";
import Link from "next/link";

interface DumrooLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function DumrooLogo({ className = "", size = "md" }: DumrooLogoProps) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  return (
    <Link href="/" className={`inline-flex items-center gap-2 group ${className}`}>
      {/* Dumroo Infinity Loop Ribbon Emblem */}
      <div className="relative flex items-center justify-center">
        <svg
          width={isSm ? "24" : isLg ? "38" : "32"}
          height={isSm ? "24" : isLg ? "38" : "32"}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Golden Yellow loop */}
          <path
            d="M8 20C8 14.4772 12.4772 10 18 10C24 10 26 30 32 30C35.3137 30 38 27.3137 38 24"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Blue connecting loop */}
          <path
            d="M32 20C32 14.4772 27.5228 10 22 10C16 10 14 30 8 30C4.68629 30 2 27.3137 2 24"
            stroke="#2563EB"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors ${
            isSm ? "text-base" : isLg ? "text-2xl" : "text-xl"
          }`}
        >
          Dumroo<span className="text-blue-600">.ai</span>
        </span>
        {!isSm && (
          <span className="text-[10px] text-slate-500 font-medium -mt-1 tracking-wider">
            AI Ecosystem for Education
          </span>
        )}
      </div>
    </Link>
  );
}
