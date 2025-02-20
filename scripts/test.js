import { spawnSync } from 'node:child_process';
import { rm } from 'node:fs';
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

// Function to run shell commands
const runCommand = (command, cwd = process.cwd()) => {
  console.log(`Running command: ${command} in directory: ${cwd}`);

  // Split the command into command and arguments
  const [cmd, ...args] = command.split(' ');

  const result = spawnSync(cmd, args, { stdio: 'inherit', cwd });

  if (result.error) {
    console.error(`Failed to execute command: ${result.error.message}`);
    throw result.error;
  }

  return result;
};

// Function to remove the generated directory
const removeGeneratedDir = (dir) => {
  try {
    console.log(`Removing generated directory: ${dir}`);
    rm(dir, { recursive: true });
    console.log(`Successfully removed: ${dir}`);
  } catch (err) {
    console.error(`Failed to remove directory: ${err.message}`);
  }
};

// Function to run build and tests
const buildAndTestApp = (command) => {
  // Assuming the generated directory is the name of the app
  const appName = command.split(' ')[2];  // Extract app name from the command
  const appDir = join(process.cwd(), appName); // Path to the generated app directory

  try {
    // Run the start command
    runCommand(command);

    // Build the app inside the generated directory
    console.log('Building app...');
    runCommand('pnpm build', appDir);

    // Test the app inside the generated directory
    console.log('Running tests...');
    if (appDir.includes("fr")){
      console.log('Test is not implemented for file based routing');
    } else {
      runCommand('pnpm test', appDir);
      console.log(`Success: ${command}`);
    }
  } catch {
    console.log(`Failed: ${command}`);
  } finally {
    // Remove the generated directory after each test
    removeGeneratedDir(appDir);
    console.log('----------------------------------------');
  }
};

// Function to run all tests
const runTests = async () => {
  for (const command of commands) {
    buildAndTestApp(command);
  }

  console.log('All combinations tested.');
};

// Start the test process
runTests().catch((err) => {
  console.error('Test run failed:', err);
});
