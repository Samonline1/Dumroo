"use client";

import React, { useState, FormEvent, KeyboardEvent } from "react";
import { Globe, BarChart3, Send, Loader2, BookOpen, GraduationCap } from "lucide-react";

interface DumrooChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const SUBJECT_OPTIONS = [
  { label: "All Subjects", value: "" },
  { label: "Mathematics", value: "Math" },
  { label: "Science", value: "Science" },
  { label: "English / ELA", value: "English" },
  { label: "Social Studies", value: "Social Studies" },
  { label: "Computer Science", value: "Computer Science" },
];

const GRADE_OPTIONS = [
  { label: "All Classes", value: "" },
  { label: "Class 6-8", value: "Class 6-8" },
  { label: "Class 9-10", value: "Class 9-10" },
  { label: "Class 11-12", value: "Class 11-12" },
];

export function DumrooChatInput({
  onSend,
  isLoading = false,
  placeholder = "Ask Dumroo.ai here...",
  disabled = false,
}: DumrooChatInputProps) {
  const [text, setText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading || disabled) return;

    let finalPrompt = text.trim();
    const filters: string[] = [];
    if (selectedGrade) filters.push(selectedGrade);
    if (selectedSubject) filters.push(selectedSubject);

    if (filters.length > 0) {
      finalPrompt = `[Context: ${filters.join(" | ")}] ${finalPrompt}`;
    }

    onSend(finalPrompt);
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      {/* Functional Filter Selectors Bar */}
      <div className="flex items-center gap-2 px-2 text-xs">
        {/* Subject Filter */}
        <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-2.5 py-1 rounded-full transition-colors">
          <BookOpen className="w-3 h-3 text-slate-500" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={disabled || isLoading}
            className="bg-transparent text-slate-700 font-medium text-[11px] focus:outline-none cursor-pointer"
          >
            {SUBJECT_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Class / Grade Filter */}
        <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-2.5 py-1 rounded-full transition-colors">
          <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            disabled={disabled || isLoading}
            className="bg-transparent text-slate-700 font-medium text-[11px] focus:outline-none cursor-pointer"
          >
            {GRADE_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Pill Input Bar */}
      <div className="relative flex items-center bg-white rounded-full border border-slate-200/90 shadow-md hover:shadow-lg transition-all duration-200 p-2 pl-3">
        {/* Left Dumroo Emblem Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 px-3 py-1.5 rounded-full select-none shrink-0 mr-2 border border-slate-200/50">
          <Globe className="w-4 h-4 text-slate-700" />

          {/* Mini Dumroo loop icon */}
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shadow-inner">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 20C8 14.4772 12.4772 10 18 10C24 10 26 30 32 30C35.3137 30 38 27.3137 38 24"
                stroke="#FBBF24"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M32 20C32 14.4772 27.5228 10 22 10C16 10 14 30 8 30C4.68629 30 2 27.3137 2 24"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <BarChart3 className="w-4 h-4 text-amber-500" />
        </div>

        {/* Center Input field */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-2 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
        />

        {/* Primary Blue Round Send Button */}
        <div className="shrink-0 pr-1">
          <button
            type="submit"
            disabled={!text.trim() || isLoading || disabled}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
              text.trim() && !isLoading && !disabled
                ? "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
