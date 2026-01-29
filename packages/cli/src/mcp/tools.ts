import { z } from 'zod'
import { fetchDocContent, fetchLibraries, fetchPartners } from './api.js'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

// Algolia config (public read-only keys)
const ALGOLIA_APP_ID = 'FQ0DQ6MA3C'
const ALGOLIA_API_KEY = '10c34d6a5c89f6048cf644d601e65172'
const ALGOLIA_INDEX = 'tanstack-test'

const GROUP_KEYS = ['state', 'headlessUI', 'performance', 'tooling'] as const

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}

function errorResult(error: string) {
  return { content: [{ type: 'text' as const, text: `Error: ${error}` }], isError: true }
}

export function registerDocTools(server: McpServer) {
  // Tool: tanstack_list_libraries
  server.tool(
    'tanstack_list_libraries',
    'List TanStack libraries with metadata, frameworks, and docs URLs.',
    {
      group: z
        .enum(GROUP_KEYS)
        .optional()
        .describe('Filter libraries by group. Options: state, headlessUI, performance, tooling'),
    },
    async ({ group }) => {
      try {
        const data = await fetchLibraries()
        let libraries = data.libraries

        if (group && data.groups[group]) {
          const groupIds = data.groups[group]
          libraries = libraries.filter((lib) => groupIds.includes(lib.id))
        }

        const groupName = group ? data.groupNames[group] || group : 'All Libraries'

        return jsonResult({
          group: groupName,
          count: libraries.length,
          libraries: libraries.map((lib) => ({
            id: lib.id,
            name: lib.name,
            tagline: lib.tagline,
            description: lib.description,
            frameworks: lib.frameworks,
            latestVersion: lib.latestVersion,
            docsUrl: lib.docsUrl,
            githubUrl: lib.githubUrl,
          })),
        })
      } catch (error) {
        return errorResult(String(error))
      }
    },
  )

  // Tool: tanstack_doc
  server.tool(
    'tanstack_doc',
    'Fetch a TanStack documentation page by library and path.',
    {
      library: z.string().describe('Library ID (e.g., query, router, table, form)'),
      path: z.string().describe('Documentation path (e.g., framework/react/overview)'),
      version: z.string().optional().describe('Version (e.g., v5, v1). Defaults to latest'),
    },
    async ({ library: libraryId, path, version = 'latest' }) => {
      try {
        const data = await fetchLibraries()
        const library = data.libraries.find((l) => l.id === libraryId)

        if (!library) {
          return errorResult(
            `Library "${libraryId}" not found. Use tanstack_list_libraries to see available libraries.`,
          )
        }

        if (version !== 'latest' && !library.availableVersions.includes(version)) {
          return errorResult(
            `Version "${version}" not found for ${library.name}. Available: ${library.availableVersions.join(', ')}`,
          )
        }

        // Resolve branch
        const branch =
          version === 'latest' || version === library.latestVersion
            ? library.latestBranch || 'main'
            : version

        const docsRoot = library.docsRoot || 'docs'
        const filePath = `${docsRoot}/${path}.md`
        const content = await fetchDocContent(library.repo, branch, filePath)

        if (!content) {
          return errorResult(
            `Document not found: ${library.name} / ${path} (version: ${version})`,
          )
        }

        // Extract frontmatter title if present
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
        let title = path.split('/').pop() || 'Untitled'
        let docContent = content

        if (frontmatterMatch && frontmatterMatch[1]) {
          const frontmatter = frontmatterMatch[1]
          const titleMatch = frontmatter.match(/title:\s*['"]?([^'"\n]+)['"]?/)
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1]
          }
          docContent = content.slice(frontmatterMatch[0].length).trim()
        }

        return jsonResult({
          title,
          content: docContent,
          url: `https://tanstack.com/${libraryId}/${version}/docs/${path}`,
          library: library.name,
          version: version === 'latest' ? library.latestVersion : version,
        })
      } catch (error) {
        return errorResult(String(error))
      }
    },
  )

  // Tool: tanstack_search_docs
  server.tool(
    'tanstack_search_docs',
    'Search TanStack documentation. Returns matching pages with snippets.',
    {
      query: z.string().describe('Search query'),
      library: z.string().optional().describe('Filter to specific library (e.g., query, router)'),
      framework: z
        .string()
        .optional()
        .describe('Filter to specific framework (e.g., react, vue, solid)'),
      limit: z
        .number()
        .min(1)
        .max(50)
        .optional()
        .describe('Maximum number of results (default: 10, max: 50)'),
    },
    async ({ query, library, framework, limit = 10 }) => {
      try {
        const ALL_LIBRARIES = [
          'config', 'form', 'optimistic', 'pacer', 'query', 'ranger',
          'react-charts', 'router', 'start', 'store', 'table', 'virtual', 'db', 'devtools',
        ]
        const ALL_FRAMEWORKS = ['react', 'vue', 'solid', 'svelte', 'angular']

        // Build filters
        const filterParts: Array<string> = ['version:latest']

        if (library) {
          const otherLibraries = ALL_LIBRARIES.filter((l) => l !== library)
          const exclusions = otherLibraries.map((l) => `NOT library:${l}`).join(' AND ')
          if (exclusions) filterParts.push(`(${exclusions})`)
        }

        if (framework) {
          const otherFrameworks = ALL_FRAMEWORKS.filter((f) => f !== framework)
          const exclusions = otherFrameworks.map((f) => `NOT framework:${f}`).join(' AND ')
          if (exclusions) filterParts.push(`(${exclusions})`)
        }

        // Call Algolia REST API directly
        const searchParams = {
          requests: [
            {
              indexName: ALGOLIA_INDEX,
              query,
              hitsPerPage: Math.min(limit, 50),
              filters: filterParts.join(' AND '),
              attributesToRetrieve: ['hierarchy', 'url', 'content', 'library'],
              attributesToSnippet: ['content:80'],
            },
          ],
        }

        const response = await fetch(
          `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/*/queries`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Algolia-Application-Id': ALGOLIA_APP_ID,
              'X-Algolia-API-Key': ALGOLIA_API_KEY,
            },
            body: JSON.stringify(searchParams),
          },
        )

        if (!response.ok) {
          return errorResult(`Algolia search failed: ${response.statusText}`)
        }

        const searchResponse = await response.json() as {
          results: Array<{
            hits: Array<{
              objectID: string
              url: string
              library?: string
              hierarchy: Record<string, string | undefined>
              content?: string
              _snippetResult?: { content?: { value?: string } }
            }>
            nbHits?: number
          }>
        }

        const searchResult = searchResponse.results[0]
        if (!searchResult) {
          return jsonResult({ query, totalHits: 0, results: [] })
        }

        const results = searchResult.hits.map((hit) => {
          const breadcrumb = Object.values(hit.hierarchy).filter((v): v is string => Boolean(v))
          return {
            title: hit.hierarchy.lvl1 || hit.hierarchy.lvl0 || 'Untitled',
            url: hit.url,
            snippet: hit._snippetResult?.content?.value || hit.content || '',
            library: hit.library || 'unknown',
            breadcrumb,
          }
        })

        return jsonResult({
          query,
          totalHits: searchResult.nbHits || results.length,
          results,
        })
      } catch (error) {
        return errorResult(String(error))
      }
    },
  )

  // Tool: tanstack_ecosystem
  server.tool(
    'tanstack_ecosystem',
    'Ecosystem partner recommendations. Filter by category (database, auth, deployment, monitoring, cms, api, data-grid) or library.',
    {
      category: z
        .string()
        .optional()
        .describe(
          'Filter by category: database, auth, deployment, monitoring, cms, api, data-grid, code-review, learning',
        ),
      library: z
        .string()
        .optional()
        .describe('Filter by TanStack library (e.g., start, router, query, table)'),
    },
    async ({ category, library }) => {
      try {
        const data = await fetchPartners()

        // Category aliases
        const categoryAliases: Record<string, string> = {
          db: 'database',
          postgres: 'database',
          sql: 'database',
          login: 'auth',
          authentication: 'auth',
          hosting: 'deployment',
          deploy: 'deployment',
          serverless: 'deployment',
          errors: 'monitoring',
          logging: 'monitoring',
          content: 'cms',
          'api-keys': 'api',
          grid: 'data-grid',
          review: 'code-review',
          courses: 'learning',
        }

        let resolvedCategory: string | undefined
        if (category) {
          const normalized = category.toLowerCase().trim()
          resolvedCategory = categoryAliases[normalized] || normalized
          if (!data.categories.includes(resolvedCategory)) {
            resolvedCategory = undefined
          }
        }

        const lib = library?.toLowerCase().trim()

        const partners = data.partners
          .filter((p) => !resolvedCategory || p.category === resolvedCategory)
          .filter((p) => !lib || p.libraries.some((l) => l === lib))
          .map((p) => ({
            id: p.id,
            name: p.name,
            tagline: p.tagline,
            description: p.description,
            category: p.category,
            categoryLabel: p.categoryLabel,
            url: p.url,
            libraries: p.libraries,
          }))

        return jsonResult({
          query: {
            category,
            categoryResolved: resolvedCategory,
            library,
          },
          count: partners.length,
          partners,
        })
      } catch (error) {
        return errorResult(String(error))
      }
    },
  )
}
