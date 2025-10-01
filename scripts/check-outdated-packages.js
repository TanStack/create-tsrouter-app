#!/usr/bin/env node

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'
import semver from 'semver'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Parse command line arguments
const args = process.argv.slice(2)
const shouldUpdate = args.includes('--update')

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

/**
 * Recursively find all package.json files in a directory
 */
function findPackageJsonFiles(dir, files = []) {
  const items = readdirSync(dir)

  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)

    if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist') {
      findPackageJsonFiles(fullPath, files)
    } else if (item === 'package.json') {
      files.push(fullPath)
    }
  }

  return files
}

// Cache for package versions to avoid duplicate API calls
const versionCache = new Map()

/**
 * Get the latest version of a package from npm with caching and timeout
 */
async function getLatestVersion(packageName) {
  // Check cache first
  if (versionCache.has(packageName)) {
    return versionCache.get(packageName)
  }

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(
      `https://registry.npmjs.org/${packageName}/latest`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'create-tsrouter-app-outdated-checker',
        },
      },
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const version = data.version

    // Cache the result
    versionCache.set(packageName, version)
    return version
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(
        `${colors.yellow}Warning: Timeout fetching latest version for ${packageName}${colors.reset}`,
      )
    } else {
      console.warn(
        `${colors.yellow}Warning: Could not fetch latest version for ${packageName}: ${error.message}${colors.reset}`,
      )
    }

    // Cache null result to avoid retrying
    versionCache.set(packageName, null)
    return null
  }
}

/**
 * Check if a version range satisfies the latest version
 */
function isVersionRangeOutdated(versionRange, latestVersion) {
  try {
    // Clean the version range (remove any npm-specific prefixes)
    const cleanRange = versionRange.replace(/^npm:/, '').split('@').pop()

    // Check if the range satisfies the latest version
    return !semver.satisfies(latestVersion, cleanRange)
  } catch (error) {
    console.warn(
      `${colors.yellow}Warning: Could not parse version range "${versionRange}": ${error.message}${colors.reset}`,
    )
    return false
  }
}

/**
 * Update package.json file with new versions
 */
function updatePackageJson(filePath, outdatedPackages) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const packageJson = JSON.parse(content)

    let updated = false

    for (const pkg of outdatedPackages) {
      // Check and update in dependencies
      if (packageJson.dependencies && packageJson.dependencies[pkg.name]) {
        const currentRange = packageJson.dependencies[pkg.name]
        const newRange = updateVersionRange(currentRange, pkg.latest)
        packageJson.dependencies[pkg.name] = newRange
        updated = true
      }

      // Check and update in devDependencies
      if (
        packageJson.devDependencies &&
        packageJson.devDependencies[pkg.name]
      ) {
        const currentRange = packageJson.devDependencies[pkg.name]
        const newRange = updateVersionRange(currentRange, pkg.latest)
        packageJson.devDependencies[pkg.name] = newRange
        updated = true
      }

      // Check and update in peerDependencies
      if (
        packageJson.peerDependencies &&
        packageJson.peerDependencies[pkg.name]
      ) {
        const currentRange = packageJson.peerDependencies[pkg.name]
        const newRange = updateVersionRange(currentRange, pkg.latest)
        packageJson.peerDependencies[pkg.name] = newRange
        updated = true
      }
    }

    if (updated) {
      // Write back with proper formatting
      writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n')
      return true
    }

    return false
  } catch (error) {
    console.error(
      `${colors.red}Error updating ${filePath}: ${error.message}${colors.reset}`,
    )
    return false
  }
}

/**
 * Update version range while preserving the range type (^, ~, etc.)
 */
function updateVersionRange(currentRange, latestVersion) {
  // Preserve the prefix (^, ~, >=, etc.)
  if (currentRange.startsWith('^')) {
    return `^${latestVersion}`
  } else if (currentRange.startsWith('~')) {
    return `~${latestVersion}`
  } else if (currentRange.startsWith('>=')) {
    return `>=${latestVersion}`
  } else if (currentRange.startsWith('>')) {
    return `>${latestVersion}`
  } else if (currentRange.startsWith('<=')) {
    return `<=${latestVersion}`
  } else if (currentRange.startsWith('<')) {
    return `<${latestVersion}`
  } else {
    // Exact version or other format, just use the latest version
    return latestVersion
  }
}

/**
 * Get relative path for display
 */
function getDisplayPath(filePath, frameworksDir) {
  const relativePath = relative(frameworksDir, filePath)
  // Remove the package.json part
  return relativePath.replace('/package.json', '')
}

/**
 * Check dependencies in a package.json file
 */
async function checkPackageJson(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const packageJson = JSON.parse(content)

    const outdatedPackages = []
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
    }

    if (Object.keys(allDependencies).length === 0) {
      return { filePath, outdatedPackages: [], totalDependencies: 0 }
    }

    const packageNames = Object.keys(allDependencies).filter((name) => {
      const versionRange = allDependencies[name]
      // Skip workspace dependencies and local packages
      return !(
        versionRange.startsWith('workspace:') ||
        versionRange.startsWith('file:') ||
        versionRange.startsWith('link:')
      )
    })

    // Process packages in batches to avoid overwhelming the API
    const batchSize = 5
    for (let i = 0; i < packageNames.length; i += batchSize) {
      const batch = packageNames.slice(i, i + batchSize)

      // Process batch in parallel
      const promises = batch.map(async (packageName) => {
        const versionRange = allDependencies[packageName]
        const latestVersion = await getLatestVersion(packageName)

        if (!latestVersion) {
          return null
        }

        if (isVersionRangeOutdated(versionRange, latestVersion)) {
          return {
            name: packageName,
            current: versionRange,
            latest: latestVersion,
          }
        }

        return null
      })

      const results = await Promise.all(promises)
      outdatedPackages.push(...results.filter(Boolean))

      // Small delay between batches
      if (i + batchSize < packageNames.length) {
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
    }

    return {
      filePath,
      outdatedPackages,
      totalDependencies: Object.keys(allDependencies).length,
    }
  } catch (error) {
    console.error(
      `${colors.red}Error processing ${filePath}: ${error.message}${colors.reset}`,
    )
    return {
      filePath,
      outdatedPackages: [],
      totalDependencies: 0,
      error: error.message,
    }
  }
}

/**
 * Main function
 */
async function main() {
  const actionText = shouldUpdate ? 'Updating' : 'Checking for'
  console.log(
    `${colors.bold}${colors.blue}${actionText} outdated packages in frameworks directory...${colors.reset}\n`,
  )

  const frameworksDir = join(__dirname, '..', 'frameworks')
  const packageJsonFiles = findPackageJsonFiles(frameworksDir)

  console.log(`Found ${packageJsonFiles.length} package.json files\n`)

  let totalOutdated = 0
  let totalChecked = 0
  let totalUpdated = 0
  const results = []

  for (let i = 0; i < packageJsonFiles.length; i++) {
    const filePath = packageJsonFiles[i]
    const displayPath = getDisplayPath(filePath, frameworksDir)

    // Show progress
    process.stdout.write(
      `\r${colors.blue}Processing ${i + 1}/${packageJsonFiles.length}: ${displayPath}...${colors.reset}`,
    )

    const result = await checkPackageJson(filePath)
    results.push(result)

    if (result.error) {
      console.log(`\n${colors.red}Error: ${result.error}${colors.reset}`)
      continue
    }

    totalChecked += result.totalDependencies
    totalOutdated += result.outdatedPackages.length

    if (result.outdatedPackages.length > 0) {
      console.log(
        `\n${colors.red}${colors.bold}Found ${result.outdatedPackages.length} outdated packages in ${displayPath}:${colors.reset}`,
      )
      for (const pkg of result.outdatedPackages) {
        console.log(
          `  ${colors.red}${pkg.name}${colors.reset}: ${pkg.current} → ${colors.green}${pkg.latest}${colors.reset}`,
        )
      }

      if (shouldUpdate) {
        const updated = updatePackageJson(filePath, result.outdatedPackages)
        if (updated) {
          totalUpdated++
          console.log(
            `  ${colors.green}✓ Updated ${displayPath}${colors.reset}`,
          )
        } else {
          console.log(
            `  ${colors.yellow}⚠ Failed to update ${displayPath}${colors.reset}`,
          )
        }
      }

      console.log()
    }
  }

  // Clear progress line and add spacing
  console.log('\n')

  // Summary
  console.log(`${colors.bold}${colors.blue}Summary:${colors.reset}`)
  console.log(`Total dependencies checked: ${totalChecked}`)
  console.log(
    `Total outdated packages: ${colors.red}${totalOutdated}${colors.reset}`,
  )

  if (shouldUpdate) {
    console.log(
      `Total files updated: ${colors.green}${totalUpdated}${colors.reset}`,
    )
  }

  if (totalOutdated === 0) {
    console.log(
      `${colors.green}${colors.bold}🎉 All packages are up to date!${colors.reset}`,
    )
  } else if (shouldUpdate && totalUpdated > 0) {
    console.log(
      `${colors.green}${colors.bold}✅ Successfully updated ${totalUpdated} files with outdated packages!${colors.reset}`,
    )
  } else if (shouldUpdate && totalUpdated === 0) {
    console.log(
      `${colors.yellow}${colors.bold}⚠️  No files were updated. Check for errors above.${colors.reset}`,
    )
  } else {
    console.log(
      `${colors.yellow}${colors.bold}⚠️  Found outdated packages that need attention. Use --update to update them.${colors.reset}`,
    )
  }

  // Exit with error code if outdated packages found and not updating
  process.exit(totalOutdated > 0 && !shouldUpdate ? 1 : 0)
}

main().catch((error) => {
  console.error(
    `${colors.red}${colors.bold}Fatal error: ${error.message}${colors.reset}`,
  )
  process.exit(1)
})
