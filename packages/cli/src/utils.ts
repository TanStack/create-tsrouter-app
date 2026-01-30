import { basename } from 'node:path'
import validatePackageName from 'validate-npm-package-name'
import type { TemplateOptions } from './types.js'

export function convertTemplateToMode(template: TemplateOptions): string {
  if (template === 'typescript' || template === 'javascript') {
    return 'code-router'
  }
  return 'file-router'
}

export function sanitizePackageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/_/g, '-') // Replace underscores with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove invalid characters
    .replace(/^[^a-z]+/, '') // Ensure it starts with a letter
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/-$/, '') // Remove trailing hyphen
}

export function getCurrentDirectoryName(): string {
  return basename(process.cwd())
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
