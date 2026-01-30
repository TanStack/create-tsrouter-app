import type {
  AddOn,
  AttributedFile,
  DependencyAttribution,
  FileProvenance,
  Framework,
  Integration,
  IntegrationWithSource,
  LineAttribution,
  Starter,
} from './types.js'

export interface AttributionInput {
  framework: Framework
  chosenAddOns: Array<AddOn>
  starter?: Starter
  files: Record<string, string>
}

export interface AttributionOutput {
  attributedFiles: Record<string, AttributedFile>
  dependencies: Array<DependencyAttribution>
}

type Source = { sourceId: string; sourceName: string }

// A pattern to search for in file content, with its source add-on
interface Injection {
  matches: (line: string) => boolean
  appliesTo: (filePath: string) => boolean
  source: Source
}

function normalizePath(path: string): string {
  let p = path.startsWith('./') ? path.slice(2) : path
  p = p.replace(/\.ejs$/, '').replace(/_dot_/g, '.')
  const match = p.match(/^(.+\/)?__([^_]+)__(.+)$/)
  return match ? (match[1] || '') + match[3] : p
}

async function getFileProvenance(
  filePath: string,
  framework: Framework,
  addOns: Array<AddOn>,
  starter?: Starter,
): Promise<FileProvenance | null> {
  const target = filePath.startsWith('./') ? filePath.slice(2) : filePath

  if (starter) {
    const files = await starter.getFiles()
    if (files.some((f: string) => normalizePath(f) === target)) {
      return {
        source: 'starter',
        sourceId: starter.id,
        sourceName: starter.name,
      }
    }
  }

  // Order add-ons by type then phase (matches writeFiles order), check in reverse
  const typeOrder = ['add-on', 'example', 'toolchain', 'deployment']
  const phaseOrder = ['setup', 'add-on', 'example']
  const ordered = typeOrder.flatMap((type) =>
    phaseOrder.flatMap((phase) =>
      addOns.filter((a) => a.phase === phase && a.type === type),
    ),
  )

  for (let i = ordered.length - 1; i >= 0; i--) {
    const files = await ordered[i].getFiles()
    if (files.some((f: string) => normalizePath(f) === target)) {
      return {
        source: 'add-on',
        sourceId: ordered[i].id,
        sourceName: ordered[i].name,
      }
    }
  }

  const frameworkFiles = await framework.getFiles()
  if (frameworkFiles.some((f: string) => normalizePath(f) === target)) {
    return {
      source: 'framework',
      sourceId: framework.id,
      sourceName: framework.name,
    }
  }

  return null
}

// Build injection patterns from integrations (for source files)
function integrationInjections(int: IntegrationWithSource): Array<Injection> {
  const source = { sourceId: int._sourceId, sourceName: int._sourceName }
  const injections: Array<Injection> = []

  const appliesTo = (path: string) => {
    if (int.type === 'vite-plugin') return path.includes('vite.config')
    if (
      int.type === 'provider' ||
      int.type === 'root-provider' ||
      int.type === 'devtools'
    ) {
      return path.includes('__root') || path.includes('root.tsx')
    }
    return false
  }

  if (int.import) {
    const prefix = int.import.split(' from ')[0]
    injections.push({
      matches: (line) => line.includes(prefix),
      appliesTo,
      source,
    })
  }

  const code = int.code || int.jsName
  if (code) {
    injections.push({
      matches: (line) => line.includes(code),
      appliesTo,
      source,
    })
  }

  return injections
}

// Build injection pattern from a dependency (for package.json)
function dependencyInjection(dep: DependencyAttribution): Injection {
  return {
    matches: (line) => line.includes(`"${dep.name}"`),
    appliesTo: (path) => path.endsWith('package.json'),
    source: { sourceId: dep.sourceId, sourceName: dep.sourceName },
  }
}

export async function computeAttribution(
  input: AttributionInput,
): Promise<AttributionOutput> {
  const { framework, chosenAddOns, starter, files } = input

  // Collect integrations tagged with source
  const integrations: Array<IntegrationWithSource> = chosenAddOns.flatMap(
    (addOn) =>
      (addOn.integrations || []).map((int: Integration) => ({
        ...int,
        _sourceId: addOn.id,
        _sourceName: addOn.name,
      })),
  )

  // Collect dependencies from add-ons (from packageAdditions or packageTemplate)
  const dependencies: Array<DependencyAttribution> = chosenAddOns.flatMap(
    (addOn) => {
      const result: Array<DependencyAttribution> = []
      const source = { sourceId: addOn.id, sourceName: addOn.name }

      const addDeps = (
        deps: Record<string, unknown> | undefined,
        type: 'dependency' | 'devDependency',
      ) => {
        if (!deps) return
        for (const [name, version] of Object.entries(deps)) {
          if (typeof version === 'string') {
            result.push({ name, version, type, ...source })
          }
        }
      }

      // From static package.json
      addDeps(addOn.packageAdditions?.dependencies, 'dependency')
      addDeps(addOn.packageAdditions?.devDependencies, 'devDependency')

      // From package.json.ejs template (strip EJS tags and parse)
      if (addOn.packageTemplate) {
        try {
          const tmpl = JSON.parse(
            addOn.packageTemplate.replace(/"[^"]*<%[^%]*%>[^"]*"/g, '""'),
          )
          addDeps(tmpl.dependencies, 'dependency')
          addDeps(tmpl.devDependencies, 'devDependency')
        } catch {}
      }

      return result
    },
  )

  // Build unified injection patterns from both integrations and dependencies
  const injections: Array<Injection> = [
    ...integrations.flatMap(integrationInjections),
    ...dependencies.map(dependencyInjection),
  ]

  const attributedFiles: Record<string, AttributedFile> = {}

  for (const [filePath, content] of Object.entries(files)) {
    const provenance = await getFileProvenance(
      filePath,
      framework,
      chosenAddOns,
      starter,
    )
    if (!provenance) continue

    const lines = content.split('\n')
    const relevant = injections.filter((inj) => inj.appliesTo(filePath))

    // Find injected lines
    const injectedLines = new Map<number, Source>()
    for (const inj of relevant) {
      lines.forEach((line, i) => {
        if (inj.matches(line) && !injectedLines.has(i + 1)) {
          injectedLines.set(i + 1, inj.source)
        }
      })
    }

    attributedFiles[filePath] = {
      content,
      provenance,
      lineAttributions: lines.map((_, i): LineAttribution => {
        const lineNum = i + 1
        const inj = injectedLines.get(lineNum)
        return inj
          ? {
              line: lineNum,
              sourceId: inj.sourceId,
              sourceName: inj.sourceName,
              type: 'injected',
            }
          : {
              line: lineNum,
              sourceId: provenance.sourceId,
              sourceName: provenance.sourceName,
              type: 'original',
            }
      }),
    }
  }

  return { attributedFiles, dependencies }
}
