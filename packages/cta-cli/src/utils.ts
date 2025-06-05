import type { TemplateOptions } from './types.js'

export function convertTemplateToMode(template: TemplateOptions): string {
  if (template === 'typescript' || template === 'javascript') {
    return 'code-router'
  }
  return 'file-router'
}
