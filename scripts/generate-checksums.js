#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Recursively gets all files in a directory
 * @param {string} dir - Directory to scan
 * @param {string[]} fileList - Accumulator for file paths
 * @returns {string[]} Array of file paths
 */
function getAllFiles(dir, fileList = []) {
  try {
    const files = readdirSync(dir)

    files.forEach((file) => {
      const filePath = join(dir, file)
      try {
        const stat = statSync(filePath)

        if (stat.isDirectory()) {
          // Skip node_modules and dist directories
          if (file !== 'node_modules' && file !== 'dist') {
            getAllFiles(filePath, fileList)
          }
        } else {
          fileList.push(filePath)
        }
      } catch (err) {
        console.warn(`Warning: Could not read ${filePath}: ${err.message}`)
      }
    })
  } catch (err) {
    console.warn(`Warning: Could not read directory ${dir}: ${err.message}`)
  }

  return fileList
}

/**
 * Generates a checksum for all files in specified directories
 * @param {string} baseDir - Base directory path
 * @param {string[]} directories - Array of directory names to checksum
 * @returns {string} Hex checksum
 */
function generateChecksum(baseDir, directories) {
  const hash = createHash('sha256')
  const allFiles = []

  // Collect all files from specified directories
  directories.forEach((dir) => {
    const dirPath = join(baseDir, dir)
    const files = getAllFiles(dirPath)
    allFiles.push(...files)
  })

  // Sort files to ensure consistent ordering
  allFiles.sort()

  // Hash each file's content
  allFiles.forEach((filePath) => {
    try {
      const content = readFileSync(filePath)
      const relativePath = relative(baseDir, filePath)
      // Include the file path in the hash for uniqueness
      hash.update(relativePath)
      hash.update(content)
    } catch (err) {
      console.warn(`Warning: Could not read ${filePath}: ${err.message}`)
    }
  })

  return hash.digest('hex')
}

/**
 * Generates checksum.ts file for a framework
 * @param {string} frameworkPath - Path to the framework directory
 * @param {string} frameworkName - Name of the framework for logging
 */
function generateChecksumFile(frameworkPath, frameworkName) {
  const directories = ['add-ons', 'examples', 'hosts', 'project', 'toolchains']
  const checksum = generateChecksum(frameworkPath, directories)

  const checksumContent = `// This file is auto-generated. Do not edit manually.
// Generated from add-ons, examples, hosts, project, and toolchains directories
export const contentChecksum = '${checksum}'
`

  const checksumPath = join(frameworkPath, 'src', 'checksum.ts')
  writeFileSync(checksumPath, checksumContent, 'utf8')

  console.log(`✓ Generated checksum for ${frameworkName}: ${checksum}`)
}

// Main execution
const rootDir = join(__dirname, '..')
const reactCraPath = join(rootDir, 'frameworks', 'react-cra')
const solidPath = join(rootDir, 'frameworks', 'solid')

console.log('Generating checksums...')
generateChecksumFile(reactCraPath, 'react-cra')
generateChecksumFile(solidPath, 'solid')
console.log('✓ Checksums generated successfully')
