"use client";

import React, { useState, useEffect, useRef } from "react";
import { Message, Conversation } from "@/types";
import { fetchWithAuth } from "@/lib/api-client";
import { DumrooChatInput } from "@/components/shared/DumrooChatInput";
import { ChatMessageView } from "@/components/shared/ChatMessageView";
import { Sparkles, MessageSquare, History, PlusCircle, AlertCircle, Lightbulb } from "lucide-react";

export function StudentTutorView() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load sessions
  const loadConversations = async () => {
    try {
      const res = await fetchWithAuth("/api/conversations?type=tutoring");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setConversations(json.data);
        if (json.data.length > 0 && !activeConvId) {
          selectConversation(json.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const selectConversation = async (convId: string) => {
    setActiveConvId(convId);
    setErrorMessage(null);
    try {
      const res = await fetchWithAuth(`/api/conversations/${convId}/messages`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMessages(json.data);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleStartNewSession = () => {
    setActiveConvId(null);
    setMessages([]);
    setErrorMessage(null);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    // Optimistic message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: activeConvId || "pending",
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetchWithAuth("/api/tutor", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          conversationId: activeConvId || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to receive response from tutor");
      }

      if (!activeConvId && json.data.conversationId) {
        setActiveConvId(json.data.conversationId);
        loadConversations();
      }

      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), json.data.userMessage, json.data.message]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setErrorMessage(msg);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const promptStarters = [
    "Can you give me a hint on solving quadratic equations?",
    "Explain photosynthesis with a simple real-world analogy",
    "Help me break down this word problem step by step",
    "What are common misconceptions when adding fractions?",
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-7rem)]">
      {/* Session sidebar */}
      <div className="w-full lg:w-72 bg-slate-50/80 rounded-3xl p-4 border border-slate-200/80 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <History className="w-4 h-4 text-blue-600" />
              <span>Tutoring Sessions</span>
            </div>
            <button
              onClick={handleStartNewSession}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-full transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-16rem)] pr-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-400 p-2">No tutoring sessions yet. Ask your first question!</p>
            ) : (
              conversations.map((c) => {
                const isSelected = c.id === activeConvId;
                return (
                  <button
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-white text-blue-700 font-semibold shadow-sm border border-slate-200/90"
                        : "text-slate-600 hover:bg-white/60"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                    <span className="truncate">{c.title}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-3 text-[11px] text-blue-900 flex items-start gap-2 mt-4">
          <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            <strong>Tutor Mode:</strong> Dumroo will coach you with step-by-step hints and questions to build your mastery!
          </p>
        </div>
      </div>

      {/* Chat pane */}
      <div className="flex-1 flex flex-col justify-between bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="max-w-md">
                <h3 className="text-xl font-bold text-slate-900">
                  Dumroo AI Student Tutor
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Ask any subject or homework question. I will guide you with hints, explanations, and step-by-step examples.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full pt-4">
                {promptStarters.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 text-left rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50 hover:border-blue-300 text-xs text-slate-700 transition-all font-medium flex items-start gap-2"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => <ChatMessageView key={m.id} message={m} />)
          )}

          {isLoading && (
            <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl w-fit text-xs text-slate-500 animate-pulse">
              <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Dumroo AI Tutor is thinking through the steps...</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <DumrooChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask your tutor a question (e.g., 'How do I solve this problem?')..."
          />
        </div>
      </div>
    </div>
  );
}
