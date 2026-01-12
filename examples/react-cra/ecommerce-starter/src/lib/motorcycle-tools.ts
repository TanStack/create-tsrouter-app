import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import motorcycles from "@/data/motorcycles";

// Tool definition for getting motorcycles
export const getMotorcyclesToolDef = toolDefinition({
  name: "getMotorcycles",
  description: "Get all motorcycles from the database",
  inputSchema: z.object({}),
  outputSchema: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      image: z.string(),
      description: z.string(),
      shortDescription: z.string(),
      price: z.number(),
      engineSize: z.number(),
      type: z.enum(["scooter", "cruiser", "adventure", "sport", "supersport"]),
    })
  ),
});

// Server implementation
export const getMotorcycles = getMotorcyclesToolDef.server(() => motorcycles);

// Tool definition for motorcycle recommendation
export const recommendMotorcycleToolDef = toolDefinition({
  name: "recommendMotorcycle",
  description:
    "REQUIRED tool to display a motorcycle recommendation to the user. This tool MUST be used whenever recommending a motorcycle - do NOT write recommendations yourself. This displays the motorcycle in a special appealing format with a view details button.",
  inputSchema: z.object({
    id: z
      .union([z.string(), z.number()])
      .describe(
        "The ID of the motorcycle to recommend (from the getMotorcycles results)"
      ),
  }),
  outputSchema: z.object({
    id: z.number(),
  }),
});
