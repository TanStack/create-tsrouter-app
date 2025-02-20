import { spawn } from 'node:child_process';
import fs from 'node:fs/promises'; // Use promises for async operations
import { join } from 'node:path';

// List of commands to test with `--package-manager pnpm`
const commands = [
  'pnpm start app-js --package-manager pnpm',
  'pnpm start app-ts --template typescript --package-manager pnpm',
  'pnpm start app-js-tw --tailwind --package-manager pnpm',
  'pnpm start app-js-qr --query --package-manager pnpm',
  'pnpm start app-ts-tw --template typescript --tailwind --package-manager pnpm',
  'pnpm start app-ts-qr --template typescript --query --package-manager pnpm',
  'pnpm start app-fr --template file-router --package-manager pnpm',
  'pnpm start app-fr-tw --template file-router --tailwind --package-manager pnpm',
  'pnpm start app-fr-qr --template file-router --query --package-manager pnpm'
];

// Stores the result of each test
const results = [];

// Function to run shell commands asynchronously, suppressing output
const runCommand = (command, cwd = process.cwd()) => {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');

    const child = spawn(cmd, args, { stdio: 'ignore', cwd }); // Suppress output

    child.on('error', (err) => {
      reject(`Error executing command: ${err.message}`);
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        reject(`Command failed with exit code ${code}`);
      } else {
        resolve();
      }
    });
  });
};

// Function to remove the generated directory asynchronously
const removeGeneratedDir = async (dir) => {
  try {
    await fs.rm(dir, { recursive: true, force: true }); // Ignore errors if the dir doesn't exist
  } catch (err) {
    console.error(`Failed to remove directory: ${err.message}`);
  }
};

// Function to run build and tests asynchronously
const buildAndTestApp = async (command) => {
  const appName = command.split(' ')[2]; // Extract app name from the command
  const appDir = join(process.cwd(), appName); // Path to the generated app directory

  try {
    await runCommand(command);
    await runCommand('pnpm build', appDir);
    
    if (appDir.includes("fr")) {
      results.push({ appName, status: 'Skipped (file-based routing)' });
    } else {
      await runCommand('pnpm test', appDir);
      results.push({ appName, status: 'Success' });
    }
  } catch (error) {
    results.push({ appName, status: `Failed: ${error}` });
  } finally {
    await removeGeneratedDir(appDir);
  }
};

// Function to run all tests concurrently
const runTests = async () => {
  const testPromises = commands.map(command => {
    console.log(`Running test for command: ${command}`);
    return buildAndTestApp(command)
  }); // Map each command to an async function

  await Promise.all(testPromises); // Run all tests concurrently

  // Print the final report
  console.log('Test Report:');
  results.forEach(result => {
    console.log(`${result.appName}: ${result.status}`);
  });

  console.log('----------------------------------------');
  console.log('All combinations tested.');
};

// Start the test process
runTests().catch((err) => {
  console.error('Test run failed:', err);
});
