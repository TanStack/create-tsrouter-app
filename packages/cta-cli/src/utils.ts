import type { TemplateOptions } from './types.js'
import validatePackageName from "validate-npm-package-name";

export function convertTemplateToMode(template: TemplateOptions): string {
  if (template === 'typescript' || template === 'javascript') {
    return 'code-router'
  }
  return 'file-router'
}

export function validateProjectName(name: string) {
  const {
    validForNewPackages,
    validForOldPackages,
    errors,
    warnings,
  } = validatePackageName(name);
  const error = errors?.[0] || warnings?.[0] || 'Invalid project name';

  return {
    valid: validForNewPackages && validForOldPackages,
    error: error?.replace('name', 'Project name') || 'Invalid project name',
  }
}