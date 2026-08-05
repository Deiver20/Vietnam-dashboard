"use client";

import { useCallback } from "react";
import { useAiPanelEnv } from "./env";
import { useDashboard } from "@/store/useDashboard";
import { post } from "@/app/actions/http";
import type { ChatContext } from "@/app/interfaces/trade/interface";

/* Chat logic is the Vietnam /trade/chat contract — only the visual shell
   comes from the AGM panel. Context is built from the real trade data the
   dashboard tabs render (overview/totals via env), exactly like the
   dashboard's own ChatView. */
export function useAiChat() {
  const { overview, totals } = useAiPanelEnv();
  const {
    chatMessages,
    addChatMessage,
    clearChat,
    isLoadingChat,
    setIsLoadingChat,
  } = useDashboard();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoadingChat) return;

      addChatMessage({ role: "user", content });
      setIsLoadingChat(true);

      try {
        const messages = chatMessages
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));
        messages.push({ role: "user", content });

        const context: ChatContext = {
          stats: {
            totalMt: totals?.totalMt,
            records: totals?.records,
            countries: totals?.countries,
            products: totals?.products,
          },
          filters: {},
          dataSnapshot: {
            topCountries: overview.slice(0, 5),
            topProducts: [],
          },
        };

        const response = await post<{
          success: boolean;
          data: { message: string };
        }>("/trade/chat", { messages, context });

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
      overview,
      totals,
      isLoadingChat,
    ]
  );

  return { chatMessages, sendMessage, clearChat, isLoadingChat };
}
