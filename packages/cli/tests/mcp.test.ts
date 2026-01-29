import { describe, it, expect, vi, beforeEach } from 'vitest'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerDocTools } from '../src/mcp/tools.js'
import * as api from '../src/mcp/api.js'

vi.mock('../src/mcp/api.js')

const mockLibrariesResponse = {
  libraries: [
    {
      id: 'query',
      name: 'TanStack Query',
      tagline: 'Powerful asynchronous state management',
      description: 'Data fetching library',
      frameworks: ['react', 'vue', 'solid'],
      latestVersion: 'v5',
      latestBranch: 'main',
      availableVersions: ['v5', 'v4'],
      docsUrl: 'https://tanstack.com/query',
      githubUrl: 'https://github.com/TanStack/query',
      repo: 'TanStack/query',
      docsRoot: 'docs',
    },
    {
      id: 'router',
      name: 'TanStack Router',
      tagline: 'Type-safe routing',
      description: 'Router library',
      frameworks: ['react'],
      latestVersion: 'v1',
      latestBranch: 'main',
      availableVersions: ['v1'],
      docsUrl: 'https://tanstack.com/router',
      githubUrl: 'https://github.com/TanStack/router',
      repo: 'TanStack/router',
      docsRoot: 'docs',
    },
  ],
  groups: {
    state: ['query'],
    headlessUI: [],
    performance: [],
    tooling: ['router'],
  },
  groupNames: {
    state: 'State Management',
    headlessUI: 'Headless UI',
    performance: 'Performance',
    tooling: 'Tooling',
  },
}

const mockPartnersResponse = {
  partners: [
    {
      id: 'neon',
      name: 'Neon',
      description: 'Serverless Postgres',
      category: 'database',
      categoryLabel: 'Database',
      libraries: ['start', 'router'],
      url: 'https://neon.tech',
    },
  ],
  categories: ['database', 'auth'],
  categoryLabels: {
    database: 'Database',
    auth: 'Authentication',
  },
}

describe('MCP Tools', () => {
  let server: McpServer
  let registeredTools: Map<string, { handler: Function; schema: unknown }>

  beforeEach(() => {
    vi.resetAllMocks()

    // Create a mock server that captures tool registrations
    registeredTools = new Map()
    server = {
      tool: vi.fn((name, description, schema, handler) => {
        registeredTools.set(name, { handler, schema })
      }),
    } as unknown as McpServer

    vi.mocked(api.fetchLibraries).mockResolvedValue(mockLibrariesResponse)
    vi.mocked(api.fetchPartners).mockResolvedValue(mockPartnersResponse)
    vi.mocked(api.fetchDocContent).mockResolvedValue('# Test Doc\n\nContent here')

    registerDocTools(server)
  })

  describe('tanstack_list_libraries', () => {
    it('should register the tool', () => {
      expect(registeredTools.has('tanstack_list_libraries')).toBe(true)
    })

    it('should list all libraries when no group specified', async () => {
      const tool = registeredTools.get('tanstack_list_libraries')!
      const result = await tool.handler({})

      expect(result.content[0].type).toBe('text')
      const data = JSON.parse(result.content[0].text)
      expect(data.count).toBe(2)
      expect(data.libraries).toHaveLength(2)
    })

    it('should filter libraries by group', async () => {
      const tool = registeredTools.get('tanstack_list_libraries')!
      const result = await tool.handler({ group: 'state' })

      const data = JSON.parse(result.content[0].text)
      expect(data.count).toBe(1)
      expect(data.libraries[0].id).toBe('query')
      expect(data.group).toBe('State Management')
    })

    it('should handle API errors', async () => {
      vi.mocked(api.fetchLibraries).mockRejectedValue(new Error('Network error'))

      const tool = registeredTools.get('tanstack_list_libraries')!
      const result = await tool.handler({})

      expect(result.isError).toBe(true)
      expect(result.content[0].text).toContain('Error')
    })
  })

  describe('tanstack_doc', () => {
    it('should register the tool', () => {
      expect(registeredTools.has('tanstack_doc')).toBe(true)
    })

    it('should fetch doc content', async () => {
      const tool = registeredTools.get('tanstack_doc')!
      const result = await tool.handler({
        library: 'query',
        path: 'framework/react/overview',
      })

      expect(api.fetchDocContent).toHaveBeenCalledWith(
        'TanStack/query',
        'main',
        'docs/framework/react/overview.md',
      )

      const data = JSON.parse(result.content[0].text)
      expect(data.content).toContain('# Test Doc')
    })

    it('should error for unknown library', async () => {
      const tool = registeredTools.get('tanstack_doc')!
      const result = await tool.handler({
        library: 'unknown',
        path: 'overview',
      })

      expect(result.isError).toBe(true)
      expect(result.content[0].text).toContain('not found')
    })

    it('should error for unknown version', async () => {
      const tool = registeredTools.get('tanstack_doc')!
      const result = await tool.handler({
        library: 'query',
        path: 'overview',
        version: 'v999',
      })

      expect(result.isError).toBe(true)
      expect(result.content[0].text).toContain('Version')
    })

    it('should handle 404 doc', async () => {
      vi.mocked(api.fetchDocContent).mockResolvedValue(null)

      const tool = registeredTools.get('tanstack_doc')!
      const result = await tool.handler({
        library: 'query',
        path: 'nonexistent',
      })

      expect(result.isError).toBe(true)
      expect(result.content[0].text).toContain('not found')
    })
  })

  describe('tanstack_ecosystem', () => {
    it('should register the tool', () => {
      expect(registeredTools.has('tanstack_ecosystem')).toBe(true)
    })

    it('should list ecosystem partners', async () => {
      const tool = registeredTools.get('tanstack_ecosystem')!
      const result = await tool.handler({})

      const data = JSON.parse(result.content[0].text)
      expect(data.partners).toHaveLength(1)
      expect(data.partners[0].id).toBe('neon')
    })

    it('should filter by category', async () => {
      const tool = registeredTools.get('tanstack_ecosystem')!
      const result = await tool.handler({ category: 'database' })

      const data = JSON.parse(result.content[0].text)
      expect(data.partners).toHaveLength(1)
    })

    it('should filter by library', async () => {
      const tool = registeredTools.get('tanstack_ecosystem')!
      const result = await tool.handler({ library: 'start' })

      const data = JSON.parse(result.content[0].text)
      expect(data.partners).toHaveLength(1)
    })
  })

  describe('tanstack_search_docs', () => {
    it('should register the tool', () => {
      expect(registeredTools.has('tanstack_search_docs')).toBe(true)
    })
  })
})
