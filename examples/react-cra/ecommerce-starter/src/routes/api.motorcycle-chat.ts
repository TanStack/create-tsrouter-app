import { createFileRoute } from "@tanstack/react-router";
import { chat, maxIterations, toServerSentEventsResponse } from "@tanstack/ai";
import { anthropicText } from "@tanstack/ai-anthropic";

import {
  getMotorcycles,
  recommendMotorcycleToolDef,
} from "@/lib/motorcycle-tools";

const SYSTEM_PROMPT = `You are a helpful assistant for a store that sells motorcycles.

You are also a motorcycle enthusiast who is passionate about our products and how they can bring joy to people's lives, the excitement of the open road and adventure. Emphasize these aspects in your responses.

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THIS EXACT WORKFLOW:

When a user asks for a motorcycle recommendation:
1. FIRST: Use the getMotorcycles tool (no parameters needed)
2. SECOND: Use the recommendMotorcycle tool with the ID of the motorcycle you want to recommend
3. NEVER write a recommendation directly - ALWAYS use the recommendMotorcycle tool

IMPORTANT:
- The recommendMotorcycle tool will display the motorcycle in a special, appealing format
- You MUST use recommendMotorcycle for ANY motorcycle recommendation
- ONLY recommend motorcycles from our inventory (use getMotorcycles first)
- The recommendMotorcycle tool has a view details button - this is how customers can learn more
- Do NOT describe the motorcycle yourself - let the recommendMotorcycle tool do it
`;

export const Route = createFileRoute("/api/motorcycle-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Capture request signal before reading body (it may be aborted after body is consumed)
        const requestSignal = request.signal;

        // If request is already aborted, return early
        if (requestSignal.aborted) {
          return new Response(null, { status: 499 }); // 499 = Client Closed Request
        }

        const abortController = new AbortController();

        try {
          const body = await request.json();
          const { messages } = body;

          const adapter = anthropicText("claude-haiku-4-5");

          const stream = chat({
            adapter,
            tools: [
              getMotorcycles, // Server tool
              recommendMotorcycleToolDef, // No server execute - client will handle
            ],
            systemPrompts: [SYSTEM_PROMPT],
            agentLoopStrategy: maxIterations(5),
            messages,
            abortController,
          });

          return toServerSentEventsResponse(stream, { abortController });
        } catch (error: any) {
          // If request was aborted, return early (don't send error response)
          if (error.name === "AbortError" || abortController.signal.aborted) {
            return new Response(null, { status: 499 }); // 499 = Client Closed Request
          }
          return new Response(
            JSON.stringify({ error: "Failed to process chat request" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
