"use client";

import React, { useState, useEffect } from "react";
import { StudentMonitoringItem, Conversation, Message } from "@/types";
import { fetchWithAuth } from "@/lib/api-client";
import {
  X,
  GraduationCap,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  Sparkles,
  BookOpen,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface StudentDetailModalProps {
  student: StudentMonitoringItem | null;
  onClose: () => void;
}

export function StudentDetailModal({ student, onClose }: StudentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"sessions" | "activity">("sessions");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConv, setIsLoadingConv] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (!student) return;

    setSelectedConv(null);
    setMessages([]);

    const fetchStudentSessions = async () => {
      setIsLoadingConv(true);
      try {
        const res = await fetchWithAuth(`/api/conversations?userId=${student.id}&type=tutoring`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setConversations(json.data);
          if (json.data.length > 0) {
            loadMessages(json.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load student sessions:", err);
      } finally {
        setIsLoadingConv(false);
      }
    };

    fetchStudentSessions();
  }, [student]);

  const loadMessages = async (conv: Conversation) => {
    setSelectedConv(conv);
    setIsLoadingMessages(true);
    try {
      const res = await fetchWithAuth(`/api/conversations/${conv.id}/messages`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMessages(json.data);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
                {student.isActive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Active Student
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-medium">
                    <XCircle className="w-3 h-3" />
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Sessions: <strong>{student.totalConversations}</strong> • Messages:{" "}
                <strong>{student.totalMessages}</strong> • Last Active:{" "}
                {student.lastActive ? new Date(student.lastActive).toLocaleDateString() : "Never"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 pt-3 border-b border-slate-100 flex items-center gap-3 bg-white">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "sessions"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Tutoring Conversations ({conversations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "activity"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Activity Audit Log ({student.recentActivities.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {activeTab === "sessions" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[350px]">
              {/* Left Column: Sessions list */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 overflow-y-auto max-h-[420px] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block mb-1">
                  Topics Discussed
                </span>
                {isLoadingConv ? (
                  <p className="text-xs text-slate-400 p-3 text-center">Loading sessions...</p>
                ) : conversations.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 text-center">No tutoring sessions recorded.</p>
                ) : (
                  conversations.map((c) => {
                    const isSelected = selectedConv?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => loadMessages(c)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start justify-between gap-2 ${
                          isSelected
                            ? "bg-white text-blue-700 font-semibold shadow-sm border border-blue-200"
                            : "text-slate-600 hover:bg-white/80"
                        }`}
                      >
                        <span className="truncate">{c.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right Column: Messages Transcript */}
              <div className="md:col-span-2 border border-slate-200 rounded-2xl p-4 bg-white flex flex-col justify-between overflow-y-auto max-h-[420px]">
                {isLoadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <p className="text-xs">Loading dialogue transcript...</p>
                  </div>
                ) : !selectedConv ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
                    <BookOpen className="w-6 h-6 mb-2 text-slate-300" />
                    <p className="text-xs">Select a tutoring session from the left to view transcript.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                      <p className="font-bold text-xs text-slate-900 truncate">{selectedConv.title}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(selectedConv.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-3 pr-1">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            m.role === "user"
                              ? "bg-blue-50 text-blue-900 border border-blue-100 ml-4"
                              : "bg-slate-50 text-slate-800 border border-slate-100 mr-4"
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-slate-400">
                            {m.role === "user" ? "Student" : "AI Tutor"}
                          </span>
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Activity Events List (Cleanly formatted without raw JSON) */
            <div className="space-y-3">
              {student.recentActivities.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">No recent activity events logged.</p>
              ) : (
                student.recentActivities.map((act) => {
                  let eventLabel = "Student Event";
                  let detailText = "";

                  if (act.metadata && typeof act.metadata === "object") {
                    const m = act.metadata as Record<string, any>;
                    if (m.snippet) detailText = m.snippet;
                    else if (m.topic) detailText = `Topic: ${m.topic}`;
                    else if (m.concept) detailText = `Concept: ${m.concept}`;
                    else detailText = Object.values(m).join(" • ");
                  }

                  switch (act.activityType) {
                    case "question_asked":
                      eventLabel = "Asked Tutoring Question";
                      break;
                    case "concept_review":
                      eventLabel = "Reviewed Educational Concept";
                      break;
                    case "tutoring_question":
                      eventLabel = "Practiced Problem";
                      break;
                    default:
                      eventLabel = act.activityType.replace(/_/g, " ");
                  }

                  return (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          {eventLabel}
                        </span>
                        {detailText && (
                          <p className="text-xs text-slate-800 font-medium pt-0.5">
                            "{detailText}"
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {new Date(act.createdAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
}
