import {
  fetchServerSentEvents,
  useChat,
  createChatClientOptions,
} from "@tanstack/ai-react";
import type { InferChatMessages } from "@tanstack/ai-react";
import { clientTools } from "@tanstack/ai-client";

import { recommendMotorcycleToolDef } from "@/lib/motorcycle-tools";

const recommendMotorcycleToolClient = recommendMotorcycleToolDef.client(
  ({ id }) => ({
    id: +id,
  })
);

const chatOptions = createChatClientOptions({
  connection: fetchServerSentEvents("/api/motorcycle-chat"),
  tools: clientTools(recommendMotorcycleToolClient),
});

export type ChatMessages = InferChatMessages<typeof chatOptions>;

export const useMotorcycleChat = () => useChat(chatOptions);
