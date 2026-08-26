"use client";

import { useRef, useEffect, useState } from "react";
import { useDashboard } from "@/store/useDashboard";
import { getTranslation } from "@/app/utils/translations";
import { TradeChatContexto } from "@/app/interfaces/trade/interface";
import { post } from "@/app/actions/http";
import { Send, Bot, User } from "lucide-react";

// Este dashboard no tiene selector de país/industria (siempre Vietnam /
// Rendering, mismos defaults que TRADE_CONFIG en el backend) -- el único eje
// que cambia en vivo dentro del mismo store es filters.flow.
const COUNTRY_CODE = "VIE";
const INDUSTRY = "Rend";

function renderMessage(content: string): React.ReactNode {
  const lines = content.split("\n");
  return lines.map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`${lineIndex}-text-${keyIndex++}`}>{line.slice(lastIndex, match.index)}</span>);
      }
      parts.push(<strong key={`${lineIndex}-bold-${keyIndex++}`}>{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(<span key={`${lineIndex}-text-${keyIndex++}`}>{line.slice(lastIndex)}</span>);
    }

    return (
      <span key={lineIndex}>
        {parts.length > 0 ? parts : line}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
}

export function ChatView() {
  const { locale, chatMessages, addChatMessage, clearChat, isLoadingChat, setIsLoadingChat } = useDashboard();
  const flow = useDashboard((s) => s.filters.flow);
  const t = getTranslation(locale);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastFlowRef = useRef<string | undefined>(flow);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // El toggle Imp/Exp de este dashboard vive en el mismo store y no navega a
  // otra ruta -- sin este reset, el historial de texto de "Exportaciones"
  // seguiría mezclado con preguntas de "Importaciones" tras cambiar el flujo.
  useEffect(() => {
    if (lastFlowRef.current === flow) return;
    lastFlowRef.current = flow;
    clearChat();
  }, [flow, clearChat]);

  const handleSend = async () => {
    if (!input.trim() || isLoadingChat || !flow) return;

    const userMessage = { role: "user" as const, content: input.trim() };
    addChatMessage(userMessage);
    setInput("");
    setIsLoadingChat(true);

    try {
      const contexto: TradeChatContexto = {
        countryCode: COUNTRY_CODE,
        industry: INDUSTRY,
        flow,
      };

      const response = await post<{ success: boolean; data: { message: string } }>("/trade/chat", {
        messages: [...chatMessages, userMessage].slice(-8),
        contexto,
      });

      addChatMessage({
        role: "assistant",
        content: response.data?.message || "No response",
      });
    } catch (error) {
      addChatMessage({
        role: "assistant",
        content: `${t.common.error}: ${error instanceof Error ? error.message : "Unknown"}`,
      });
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 p-4">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {chatMessages.length === 0 && (
          <div className="text-center py-8 text-gray-4 text-sm">
            <Bot className="w-10 h-10 mx-auto mb-3 text-blue-soft/60" />
            {t.panel.askAboutData}
          </div>
        )}

        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-blue/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-soft" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${
                message.role === "user"
                  ? "bg-blue text-white"
                  : "bg-navy-card border border-navy-line text-gray-2"
              }`}
            >
              {renderMessage(message.content)}
            </div>
            {message.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-navy-line flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-2" />
              </div>
            )}
          </div>
        ))}

        {isLoadingChat && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-blue/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-soft" />
            </div>
            <div className="bg-navy-card border border-navy-line rounded-md px-3 py-2 text-sm text-gray-3">
              {t.panel.generating}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 pt-4 border-t border-navy-line">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.panel.chatPlaceholder}
            aria-label={t.panel.chatPlaceholder}
            className="flex-1 bg-navy-card border border-navy-line rounded-sm px-3 py-2 text-sm text-white placeholder-gray-5 focus:outline-none focus:border-blue hover:border-blue/50 transition-colors"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoadingChat || !input.trim()}
            aria-label={t.panel.send}
            className="bg-gradient-to-r from-blue to-blue-2 hover:from-blue-2 hover:to-blue disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-sm px-3 py-2 transition-all shadow-md shadow-blue/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
