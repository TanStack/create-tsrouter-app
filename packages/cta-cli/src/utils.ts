import validatePackageName from 'validate-npm-package-name'
import type { TemplateOptions } from './types.js'

export function convertTemplateToMode(template: TemplateOptions): string {
  if (template === 'typescript' || template === 'javascript') {
    return 'code-router'
  }
  return 'file-router'
}

export function validateProjectName(name: string) {
  const { validForNewPackages, validForOldPackages, errors, warnings } =
    validatePackageName(name)
  const error = errors?.[0] || warnings?.[0]

  return {
    valid: validForNewPackages && validForOldPackages,
    error:
      error?.replace(/name/g, 'Project name') ||
      'Project name does not meet npm package naming requirements',
  }
}
