"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";

interface FormattedAiContentProps {
  content: string;
}

export function FormattedAiContent({ content }: FormattedAiContentProps) {
  // Sanitization
  const cleaned = content
    .replace(/^(\s*[*-_]\s*){3,}$/gm, "")
    .replace(/\*{4,}/g, "")
    .trim();

  const blocks = cleaned.split(/\n\n+/);

  return (
    <div className="space-y-3.5 text-slate-800 text-sm sm:text-base leading-relaxed">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Table parser
        if (trimmed.includes("|") && trimmed.split("\n").length >= 2) {
          const lines = trimmed.split("\n").filter((l) => l.includes("|"));
          if (lines.length >= 2) {
            const headerLine = lines[0];
            const dataLines = lines.slice(1).filter((l) => !l.replace(/[\s|:-]/g, "") === false);

            const headers = headerLine
              .split("|")
              .map((h) => h.trim())
              .filter(Boolean);

            const rows = dataLines.map((row) =>
              row
                .split("|")
                .map((c) => c.trim())
                .filter((_, i, arr) => i > 0 && i < arr.length - 1 || arr.length <= 2)
            );

            return (
              <div key={idx} className="my-4 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                      {headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-3.5 py-2.5">
                          {renderInlineText(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {rows.map((r, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                        {r.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2.5 text-slate-700">
                            {renderInlineText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // Headings
        if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
          const level = trimmed.startsWith("### ") ? 3 : trimmed.startsWith("## ") ? 2 : 1;
          const text = trimmed.replace(/^#+\s*/, "");
          return (
            <div key={idx} className="pt-2">
              <h4
                className={`font-bold tracking-tight text-slate-900 flex items-center gap-2 ${
                  level === 1 ? "text-lg sm:text-xl text-blue-700" : level === 2 ? "text-base sm:text-lg text-slate-900" : "text-sm sm:text-base text-slate-800"
                }`}
              >
                <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
                <span>{renderInlineText(text)}</span>
              </h4>
            </div>
          );
        }

        // Callouts
        const lower = trimmed.toLowerCase();
        if (lower.startsWith("**hint:") || lower.startsWith("hint:")) {
          return (
            <div
              key={idx}
              className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 flex items-start gap-2.5 my-2"
            >
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">
                {renderInlineText(trimmed.replace(/^(\*\*hint:\*\*|hint:)/i, "").trim())}
              </div>
            </div>
          );
        }

        if (lower.includes("strength") && (trimmed.startsWith("**") || lower.startsWith("strength"))) {
          return (
            <div
              key={idx}
              className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 space-y-1.5 my-2"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Strengths & Mastery</span>
              </div>
              <div className="text-xs sm:text-sm pl-5 leading-relaxed">
                {renderBulletOrParagraph(trimmed)}
              </div>
            </div>
          );
        }

        if (lower.includes("improvement") || lower.includes("misconception")) {
          return (
            <div
              key={idx}
              className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-purple-950 space-y-1.5 my-2"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-purple-800">
                <AlertCircle className="w-4 h-4 text-purple-600" />
                <span>Key Insights & Areas for Focus</span>
              </div>
              <div className="text-xs sm:text-sm pl-5 leading-relaxed">
                {renderBulletOrParagraph(trimmed)}
              </div>
            </div>
          );
        }

        // Lists
        const lines = trimmed.split("\n");
        const isBulletList = lines.every(
          (l) => l.trim().startsWith("- ") || l.trim().startsWith("* ") || /^\d+\.\s/.test(l.trim())
        );

        if (isBulletList) {
          return (
            <ul key={idx} className="space-y-1.5 my-2 pl-2">
              {lines.map((l, lIdx) => {
                const cleanItem = l.trim().replace(/^[-*]\s+|\d+\.\s+/, "");
                return (
                  <li key={lIdx} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2"></span>
                    <span className="flex-1 text-slate-700">{renderInlineText(cleanItem)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={idx} className="text-slate-700 text-xs sm:text-sm leading-relaxed">
            {renderInlineText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function renderBulletOrParagraph(text: string) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <div className="space-y-1">
      {lines.map((l, i) => (
        <p key={i} className="leading-relaxed">
          {renderInlineText(l.replace(/^[-*]\s+|\d+\.\s+/, ""))}
        </p>
      ))}
    </div>
  );
}

function renderInlineText(text: string): React.ReactNode {
  // Inline styling
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`)/g);

  return parts.map((part, i) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {boldText}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      const code = part.slice(1, -1);
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-blue-700 font-mono text-xs">
          {code}
        </code>
      );
    }
    return part;
  });
}
