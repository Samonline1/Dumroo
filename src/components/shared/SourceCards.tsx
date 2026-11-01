import React from "react";
import { SearchSource } from "@/types";
import { ExternalLink, Bookmark } from "lucide-react";

interface SourceCardsProps {
  sources?: SearchSource[] | null;
}

export function SourceCards({ sources }: SourceCardsProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
        <Bookmark className="w-3.5 h-3.5 text-blue-600" />
        <span>Verified Educational Sources ({sources.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((src, idx) => {
          let hostname = "";
          try {
            hostname = new URL(src.url).hostname;
          } catch {
            hostname = "source";
          }

          return (
            <a
              key={idx}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-1 text-xs font-medium text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                <span>{src.title || src.url}</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
              </div>
              <span className="text-[11px] text-blue-500 font-mono mt-0.5 truncate">
                {hostname}
              </span>
              {src.snippet && (
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {src.snippet}
                </p>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
