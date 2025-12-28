import { createFileRoute } from "@tanstack/react-router";
import { chat, createChatOptions } from "@tanstack/ai";
import { anthropicText } from "@tanstack/ai-anthropic";
import { geminiText } from "@tanstack/ai-gemini";
import { openaiText } from "@tanstack/ai-openai";
import { ollamaText } from "@tanstack/ai-ollama";
import { z } from "zod";

import type { Provider } from "@/lib/model-selection";

// Schema for structured recipe output
const RecipeSchema = z.object({
  name: z.string().describe("The name of the recipe"),
  description: z.string().describe("A brief description of the dish"),
  prepTime: z.string().describe('Preparation time (e.g., "15 minutes")'),
  cookTime: z.string().describe('Cooking time (e.g., "30 minutes")'),
  servings: z.number().describe("Number of servings"),
  difficulty: z.enum(["easy", "medium", "hard"]).describe("Difficulty level"),
  ingredients: z
    .array(
      z.object({
        item: z.string().describe("Ingredient name"),
        amount: z.string().describe('Amount needed (e.g., "2 cups")'),
        notes: z.string().optional().describe("Optional preparation notes"),
      })
    )
    .describe("List of ingredients"),
  instructions: z
    .array(z.string())
    .describe("Step-by-step cooking instructions"),
  tips: z.array(z.string()).optional().describe("Optional cooking tips"),
  nutritionPerServing: z
    .object({
      calories: z.number().optional(),
      protein: z.string().optional(),
      carbs: z.string().optional(),
      fat: z.string().optional(),
    })
    .optional()
    .describe("Nutritional information per serving"),
});

export type Recipe = z.infer<typeof RecipeSchema>;

export const Route = createFileRoute("/demo/api/structured")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        const { recipeName, mode = "structured" } = body;
        const data = body.data || {};
        const provider: Provider = data.provider || body.provider || "openai";
        const model: string = data.model || body.model || "gpt-4o";

        if (!recipeName || recipeName.trim().length === 0) {
          return new Response(
            JSON.stringify({
              error: "Recipe name is required",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        try {
          // Pre-define typed adapter configurations
          const adapterConfig = {
            anthropic: () =>
              createChatOptions({
                adapter: anthropicText(
                  (model || "claude-sonnet-4-5-20250929") as any
                ),
              }),
            gemini: () =>
              createChatOptions({
                adapter: geminiText((model || "gemini-2.0-flash-exp") as any),
              }),
            ollama: () =>
              createChatOptions({
                adapter: ollamaText((model || "mistral:7b") as any),
              }),
            openai: () =>
              createChatOptions({
                adapter: openaiText((model || "gpt-4o") as any),
              }),
          };

          const options = adapterConfig[provider]();

          if (mode === "structured") {
            // Structured output mode - returns validated object
            const result = await chat({
              ...options,
              messages: [
                {
                  role: "user",
                  content: `Generate a complete recipe for: ${recipeName}. Include all ingredients with amounts, step-by-step instructions, prep/cook times, and difficulty level.`,
                },
              ],
              outputSchema: RecipeSchema,
            } as any);

            return new Response(
              JSON.stringify({
                mode: "structured",
                recipe: result,
                provider,
                model,
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }
            );
          } else {
            // One-shot markdown mode - returns text
            const markdown = await chat({
              ...options,
              stream: false,
              messages: [
                {
                  role: "user",
                  content: `Generate a complete recipe for: ${recipeName}.

Format the recipe in beautiful markdown with:
- A title with the recipe name
- A brief description
- Prep time, cook time, and servings
- Ingredients list with amounts
- Numbered step-by-step instructions
- Optional tips section
- Nutritional info if applicable

Make it detailed and easy to follow.`,
                },
              ],
            } as any);

            return new Response(
              JSON.stringify({
                mode: "oneshot",
                markdown,
                provider,
                model,
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        } catch (error: any) {
          return new Response(
            JSON.stringify({
              error: error.message || "An error occurred",
            }),
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
