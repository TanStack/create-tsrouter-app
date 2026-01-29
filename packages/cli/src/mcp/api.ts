import { LibrariesResponseSchema, PartnersResponseSchema } from './types.js'
import type { LibrariesResponse, PartnersResponse } from './types.js'

const TANSTACK_API_BASE = 'https://tanstack.com/api/data'

export async function fetchLibraries(): Promise<LibrariesResponse> {
  const response = await fetch(`${TANSTACK_API_BASE}/libraries`)
  if (!response.ok) {
    throw new Error(`Failed to fetch libraries: ${response.statusText}`)
  }
  const data = await response.json()
  return LibrariesResponseSchema.parse(data)
}

export async function fetchPartners(): Promise<PartnersResponse> {
  const response = await fetch(`${TANSTACK_API_BASE}/partners`)
  if (!response.ok) {
    throw new Error(`Failed to fetch partners: ${response.statusText}`)
  }
  const data = await response.json()
  return PartnersResponseSchema.parse(data)
}

export async function fetchDocContent(
  repo: string,
  branch: string,
  filePath: string,
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}`
  const response = await fetch(url, {
    headers: { 'User-Agent': 'tanstack-cli' },
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`Failed to fetch doc: ${response.statusText}`)
  }

  return response.text()
}
