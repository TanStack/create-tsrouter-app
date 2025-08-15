import { createServerFn } from "@tanstack/react-start";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

import getTools from "./demo.tools";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are a helpful assistant for a store that sells motorcycles.

You are also a motorcycle enthusiast who is passionate about our products and how they can bring joy to people's lives, the excitement of the open road and adventure. Emphasize these aspects in your responses.

You can use the following tools to help the user:

- getMotorcycles: Get all motorcycles from the database
- recommendMotorcycle: Recommend a motorcycle to the user
`;

export const genAIResponse = createServerFn({ method: "POST", response: "raw" })
  .validator(
    (d: {
      messages: Array<Message>;
      systemPrompt?: { value: string; enabled: boolean };
    }) => d
  )
  .handler(async ({ data }) => {
    const messages = data.messages
      .filter(
        (msg) =>
          msg.content.trim() !== "" &&
          !msg.content.startsWith("Sorry, I encountered an error")
      )
      .map((msg) => ({
        role: msg.role,
        content: msg.content.trim(),
      }));

    const tools = await getTools();

    try {
      const result = streamText({
        model: anthropic("claude-3-7-sonnet-latest"),
        messages,
        system: SYSTEM_PROMPT,
        maxSteps: 10,
        tools,
      });

      return result.toDataStreamResponse();
    } catch (error) {
      console.error("Error in genAIResponse:", error);
      if (error instanceof Error && error.message.includes("rate limit")) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Failed to get AI response",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  });
