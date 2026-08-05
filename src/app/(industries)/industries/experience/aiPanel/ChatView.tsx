"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import { useAiPanelEnv } from "./env";
import { useAiChat } from "./useAiChat";
import { t } from "./strings";

export function ChatView() {
  const { chatMessages, sendMessage, clearChat, isLoadingChat } = useAiChat();
  const { dark } = useAiPanelEnv();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoadingChat) return;
    sendMessage(input);
    setInput("");
  };

  const parseMarkdownBold = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  /* Assistant messages: strip raw HTML, render **bold**, linkify the first
     email/phone per line (mailto:/tel:). */
  const formatMessage = (content: string) => {
    const sanitized = content
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "");
    const lines = sanitized.split("\n");
    return lines.map((line, i) => {
      const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
      const phoneMatch = line.match(/\+?\d[\d\s-]{6,}/);

      let element;
      if (emailMatch) {
        const email = emailMatch[0];
        const parts = line.split(email);
        element = (
          <span>
            {parseMarkdownBold(parts[0])}
            <a
              href={`mailto:${email}`}
              className="text-[#227BFF] underline hover:text-[#1B66D9]"
            >
              {email}
            </a>
            {parseMarkdownBold(parts[1])}
          </span>
        );
      } else if (phoneMatch) {
        const phone = phoneMatch[0].trim();
        const parts = line.split(phone);
        element = (
          <span>
            {parseMarkdownBold(parts[0])}
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="text-[#227BFF] underline hover:text-[#1B66D9]"
            >
              {phone}
            </a>
            {parseMarkdownBold(parts[1])}
          </span>
        );
      } else {
        element = <span>{parseMarkdownBold(line)}</span>;
      }

      return (
        <span key={i}>
          {element}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className={`shrink-0 pb-3 border-b flex items-center justify-between ${
          dark ? "border-white/10" : "border-black/[0.08]"
        }`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#227BFF]" />
          <span
            className={`text-xs font-semibold ${dark ? "text-white" : "text-gray-900"}`}
          >
            {t.aiAssistant}
          </span>
        </div>
        {chatMessages.length > 0 && (
          <button
            onClick={clearChat}
            className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] transition-colors cursor-pointer ${
              dark
                ? "text-white/50 hover:text-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Trash2 className="h-3 w-3" />
            {t.clearChat}
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-3">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Sparkles className="h-10 w-10 mb-3 text-[#227BFF] opacity-60" />
            <p
              className={`text-sm font-medium mb-1 ${dark ? "text-white" : "text-gray-900"}`}
            >
              {t.aiAssistant}
            </p>
            <p className={`text-xs ${dark ? "text-white/60" : "text-gray-600"}`}>
              {t.welcomeMessage}
            </p>
          </div>
        )}

        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#227BFF] text-white"
                  : dark
                    ? "bg-white/10 border border-white/10 text-white"
                    : "bg-black/[0.04] border border-black/[0.08] text-gray-800"
              }`}
            >
              {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {isLoadingChat && (
          <div className="flex justify-start">
            <div
              className={`rounded-lg px-3 py-2 border ${
                dark
                  ? "bg-white/10 border-white/10"
                  : "bg-black/[0.04] border-black/[0.08]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-[#227BFF]" />
                <span
                  className={`text-xs ${dark ? "text-white/50" : "text-gray-500"}`}
                >
                  {t.analyzing}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className={`shrink-0 pt-3 border-t flex gap-2 ${
          dark ? "border-white/10" : "border-black/[0.08]"
        }`}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.typeMessage}
          disabled={isLoadingChat}
          className={`flex-1 min-w-0 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#227BFF] transition-colors disabled:opacity-50 border ${
            dark
              ? "bg-white/10 border-white/10 text-white placeholder:text-white/50"
              : "bg-white border-black/[0.10] text-gray-900 placeholder:text-gray-400"
          }`}
        />
        <button
          type="submit"
          disabled={isLoadingChat || !input.trim()}
          aria-label={t.send}
          className="inline-flex items-center justify-center h-9 w-9 shrink-0 bg-[#227BFF] hover:bg-[#1B66D9] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
