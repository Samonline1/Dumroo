"use client";

import React from "react";
import { Message } from "@/types";
import { SourceCards } from "./SourceCards";
import { FormattedAiContent } from "./FormattedAiContent";
import { Sparkles } from "lucide-react";

interface ChatMessageViewProps {
  message: Message;
}

export function ChatMessageView({ message }: ChatMessageViewProps) {
  const isUser = message.role === "user";

  let timeStr = "";
  try {
    const d = new Date(message.createdAt);
    timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    timeStr = "";
  }

  if (isUser) {
    return (
      <div className="flex justify-end my-3">
        <div className="max-w-[85%] sm:max-w-[70%] flex flex-col items-end">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md">
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 mr-1">{timeStr}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start my-4 gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <Sparkles className="w-4 h-4 text-blue-600" />
      </div>

      <div className="max-w-[95%] sm:max-w-[85%] flex flex-col">
        <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-sm text-slate-800 space-y-4">
          <FormattedAiContent content={message.content} />
          <SourceCards sources={message.sources} />
        </div>
        <span className="text-[10px] text-slate-400 mt-1 ml-1">{timeStr}</span>
      </div>
    </div>
  );
}
