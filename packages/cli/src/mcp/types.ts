import { z } from 'zod'

// API response types from tanstack.com
export const LibrarySchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string().optional(),
  frameworks: z.array(z.string()),
  latestVersion: z.string(),
  latestBranch: z.string().optional(),
  availableVersions: z.array(z.string()),
  repo: z.string(),
  docsRoot: z.string().optional(),
  defaultDocs: z.string().optional(),
  docsUrl: z.string().optional(),
  githubUrl: z.string().optional(),
})

export const LibrariesResponseSchema = z.object({
  libraries: z.array(LibrarySchema),
  groups: z.record(z.array(z.string())),
  groupNames: z.record(z.string()),
})

export const PartnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string().optional(),
  description: z.string(),
  category: z.string(),
  categoryLabel: z.string(),
  libraries: z.array(z.string()),
  url: z.string(),
})

export const PartnersResponseSchema = z.object({
  partners: z.array(PartnerSchema),
  categories: z.array(z.string()),
  categoryLabels: z.record(z.string()),
})

export type Library = z.infer<typeof LibrarySchema>
export type LibrariesResponse = z.infer<typeof LibrariesResponseSchema>
export type Partner = z.infer<typeof PartnerSchema>
export type PartnersResponse = z.infer<typeof PartnersResponseSchema>
