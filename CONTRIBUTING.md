# Contributing

- Clone the repo
  - `gh repo clone TanStack/create-tsrouter-app`
- Ensure `node` is installed
  - https://nodejs.org/en/
- Ensure `pnpm` is installed
  - https://pnpm.io/installation
  - Why? We use `pnpm` to manage workspace dependencies. It's easily the best monorepo/workspace experience available as of when this was written.
- Install dependencies
  - `pnpm install`
  - This installs dependencies for all of the packages in the monorepo, even examples!
  - Dependencies inside of the packages and examples are automatically linked together as local/dynamic dependencies.
- Run the build
  - `pnpm build`
- Build an example app with the builder:
  - `node [root of the monorepo]/cli/create-tsrouter-app/dist/index.js app-js`
  - Do not attempt to build an app within the monorepo because the dependencies will be hoisted into the monorepo.
- Run `pnpm dev` at that top level to build everything in watch mode
- Run `pnpm build` and `pnpm test` to make sure the changes work
- Check your work and PR

# Framework Development with --dev-watch

The `--dev-watch` command provides real-time feedback while developing frameworks, add-ons, and starters. It watches for changes in your framework files and automatically rebuilds them.

## Using --dev-watch

To start developing a framework with live rebuilding:

```bash
node [root of the monorepo]/cli/create-tsrouter-app/dist/index.js --dev-watch ./frameworks/react-cra test-app --template typescript --package-manager bun --tailwind --add-ons shadcn
```

This command will:

- Watch the selected folder for changes (the folder with the add-ons in it)
- Automatically rebuild your app / install packages in the target folder when changes are detected (in this case it will install the shadcn addon)
- Show build output, diffs detected and any errors in real-time

## Example Workflow

1. Start the dev watch mode:

   ```bash
   pnpm dev # Build in watch mode
   rm -rf test-app && node cli/create-tsrouter-app/dist/index.js --dev-watch ./frameworks/react-cra test-app --template typescript --package-manager bun --tailwind --add-ons shadcn
   cd my-test-app && pnpm run dev # run the tsrouter vite app
   ```

2. Select the framework you want to work on from the displayed list

3. Make changes to the add-ons - they will be automatically rebuilt and your vite app will reflect the changes

# Testing Add-ons and Starters

Create the add-on or starter using the CLI. Then serve it locally from the project directory using `npx static-server`.

Then, when creating apps with add-ons:

```bash
node [root of the monorepo]/cli/create-tsrouter-app/dist/index.js app-js --add-ons http://localhost:9080/add-on.json
```

And when creating apps with a starter:

```bash
node [root of the monorepo]/cli/create-tsrouter-app/dist/index.js app-js --starter http://localhost:9080/starter.json
```

# Developing on the CTA UI

The CTA UI is somewhat tricky to develop on because it's both a web server and a React app. You need to run the CLI in "API" model and then the React app in dev mode, as well as the whole monorepo in watch mode.

## Starting the API Server

Let's start off with how to run the CLI in "API" mode. Here we are running the CLI in an empty directory in app creation mode.

```bash
CTA_DISABLE_UI=true node ../create-tsrouter-app/cli/create-tsrouter-app/dist/index.js --ui
```

If this is working you will see the following output:

```
Create TanStack API is running on http://localhost:8080
```

Note that it say "Create TanStack **API**" and not "Create TanStack **App**". This is important. This means that the CLI is providing API endpoints, but **not** serving the static build files of the React app.

Here is the same command for the `add` mode:

```bash
CTA_DISABLE_UI=true node ../create-tsrouter-app/cli/create-tsrouter-app/dist/index.js add --ui
```

## Starting the React App

Now that we have the API server running, we can start the React app in dev mode.

```bash
cd packages/cta-ui
pnpm dev:ui
```

Navigate to `http://localhost:3000` and see the React app connected to the API server on `http://localhost:8080`.

## Running the Monorepo in Watch Mode

At the top level of the monorepo, run the following command to start the build in watch mode.

```bash
pnpm dev
```

This will build the monorepo and watch for changes in any of the libraries. (It will **not** build changes for the React app within the `cta-ui` package.)

This is important because you might need to change API endpoints in the CTA library, or in the engine. If you do make those kinds of changes then the you will need to re-run the CLI in "API" mode to pick up the changes.
