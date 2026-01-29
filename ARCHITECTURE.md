## Nomenclature

- TanStack CLI - The command line interface for creating and managing TanStack applications
- Framework - A framework that supports the creation of a TanStack Application using a specific technology (e.g. React, Solid)
- `code-router` - One of two _modes_ of TanStack Application. The other is `file-router`. The code router is when the applications routes are defined in code.
- `file-router` - One of two _modes_ of TanStack Application. The other is `code-router`. The file router is when the applications routes are defined in files (usually in the `src/routes` directory).
- `add-on` - A plugin that extends the capabilities of a TanStack Application (e.g. the `tanstack-query` add-on integrates TanStack Query into the application).
- custom `add-on` - An externalized `add-on` contained in a single JSON file that can integate technologies that aren't covered with the built-in add-ons.
- `starter` - An application template that is constructed from an existing application that has been modified to the customers needs. The advantage of a starter over a cloneable git repo is that when a starter is used the add-ons and project will be created using the latest version of the framework and the add-ons. This reduces the versioning burden on the customer. This does come with a risk of potential breaking changes.

## CLI Applications

- `tanstack` - The main CLI application (`@tanstack/cli`)
- `create-tanstack` - Deprecated alias for `tanstack create`
- `create-start-app` - Deprecated alias for `tanstack create`
- `create-tsrouter-app` - Deprecated alias for `tanstack create`

## Packages

- `@tanstack/cli` - The command line interface for TanStack
- `@tanstack/create` - The core engine that powers app creation
- `@tanstack/create-ui` - The UI components for the visual app creator

## Frameworks

Frameworks are now bundled within `@tanstack/create`:
- React framework (`packages/create/src/frameworks/react`)
- Solid framework (`packages/create/src/frameworks/solid`)

## File Templates

The system uses EJS to render the files into the final application.

Below are all of the variables that are available to the file templates.

| Variable                     | Description                                                                                                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packageManager`             | The package manager that is being used (e.g. `npm`, `yarn`, `pnpm`)                                                                                                                                  |
| `projectName`                | The name of the project                                                                                                                                                                              |
| `typescript`                 | Boolean value that is `true` if TypeScript is being used, otherwise it is `false`                                                                                                                    |
| `tailwind`                   | Boolean value that is `true` if Tailwind CSS is being used, otherwise it is `false`                                                                                                                  |
| `js`                         | The file extension for files that do not include JSX. When in TypeScript mode it is `ts`. When in JavaScript mode it is `js`.                                                                        |
| `jsx`                        | The file extension for files that include JSX. When in TypeScript mode it is `tsx`. When in JavaScript mode it is `jsx`.                                                                             |
| `fileRouter`                 | Boolean value that is `true` if the file router is being used, otherwise it is `false`                                                                                                               |
| `codeRouter`                 | Boolean value that is `true` if the code router is being used, otherwise it is `false`                                                                                                               |
| `addOnEnabled`               | An object that contains the enabled add-ons. The keys are the `id` values of the add-ons. For example, if the tanstack-query add-on is enabled the `addOnEnabled]['tanstack-query']` will be `true`. |
| `addOns`                     | An array of the enabled add-on objects                                                                                                                                                               |
| `integrations`               | An array of the enabled integrations                                                                                                                                                                 |
| `routes`                     | An array containing all of the routes from all of the add-ons. (Used by the header and the `code-router` setup.)                                                                                     |
| `getPackageManagerAddScript` | A function that returns the script to add a dependency to the project.                                                                                                                               |
| `getPackageManagerRunScript` | A function that returns the script to run a command in the project.                                                                                                                                  |
| `relativePath`               | A function that returns the relative path from the current file to the specified target file.                                                                                                        |
| `ignoreFile`                 | A function that if called will tell the engine to not include this file in the application.                                                                                                          |
