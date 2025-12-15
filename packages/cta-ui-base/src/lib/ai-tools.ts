import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

// Tool definition for selecting add-ons
export const selectAddOnsToolDef = toolDefinition({
  name: 'selectAddOns',
  description:
    'Select one or more add-ons by their IDs. This will enable the specified add-ons for the project. Only pass add-ons that are currently not selected.',
  inputSchema: z.object({
    addOnIds: z
      .array(z.string())
      .describe('Array of add-on IDs to select/enable'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    selectedAddOns: z.array(z.string()),
    message: z.string(),
  }),
})

// Tool definition for unselecting add-ons
export const unselectAddOnsToolDef = toolDefinition({
  name: 'unselectAddOns',
  description:
    'Unselect one or more add-ons by their IDs. This will disable the specified add-ons for the project. Only pass add-ons that are currently selected and can be disabled (enabled=true).',
  inputSchema: z.object({
    addOnIds: z
      .array(z.string())
      .describe('Array of add-on IDs to unselect/disable'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    unselectedAddOns: z.array(z.string()),
    message: z.string(),
  }),
})
