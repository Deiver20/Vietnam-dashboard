"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDashboard } from "@/store/useDashboard";
import { post } from "@/app/actions/http";
import type { TradeChatContexto } from "@/app/interfaces/trade/interface";

/* Chat logic is the Vietnam /trade/chat contract — only the visual shell
   comes from the AGM panel. `contexto` (countryCode/industry/flow) es la
   identidad real del tablero: se lee del mismo store que ya sincroniza
   dashboardPages.tsx desde el globo (mismo campo que usa InsightsView.tsx
   para su boardKey), nunca de overview/totals. */
export function useAiChat() {
  const filters = useDashboard((s) => s.filters);
  const {
    chatMessages,
    addChatMessage,
    clearChat,
    isLoadingChat,
    setIsLoadingChat,
  } = useDashboard();

  const boardKey = `${filters.countryCode ?? ""}|${filters.industry ?? ""}|${filters.flow ?? ""}`;
  const lastBoardKeyRef = useRef<string>(boardKey);

  // Nuevo tablero (país/industria/flujo) = conversación nueva. Sin esto, el
  // historial de texto de un tablero (ej. Colombia/Exportaciones) se
  // reenviaría mezclado con preguntas sobre otro (ej. Vietnam/Importaciones)
  // aunque el filtro SQL del backend sí cambie correctamente — el dato ya
  // quedó en el texto de la conversación.
  useEffect(() => {
    if (lastBoardKeyRef.current === boardKey) return;
    lastBoardKeyRef.current = boardKey;
    clearChat();
  }, [boardKey, clearChat]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoadingChat) return;
      if (!filters.countryCode || !filters.industry || !filters.flow) return;

      addChatMessage({ role: "user", content });
      setIsLoadingChat(true);

      try {
        const messages = chatMessages
          .slice(-8)
          .map((m) => ({ role: m.role, content: m.content }));
        messages.push({ role: "user", content });

        const contexto: TradeChatContexto = {
          countryCode: filters.countryCode,
          industry: filters.industry,
          flow: filters.flow,
        };

        const response = await post<{
          success: boolean;
          data: { message: string };
        }>("/trade/chat", { messages, contexto });

        addChatMessage({
          role: "assistant",
          content: response.data?.message || "No response",
        });
      } catch (error) {
        addChatMessage({
          role: "assistant",
          content: `Something went wrong: ${
            error instanceof Error ? error.message : "Unknown"
          }`,
        });
      } finally {
        setIsLoadingChat(false);
      }
    },
    [
      chatMessages,
      addChatMessage,
      setIsLoadingChat,
      filters.countryCode,
      filters.industry,
      filters.flow,
      isLoadingChat,
    ]
  );

  return { chatMessages, sendMessage, clearChat, isLoadingChat };
}
