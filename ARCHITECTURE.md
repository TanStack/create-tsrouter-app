## Nomenclature

- `cta` - Create Tanstack Application
- CTA Framework - A framework that supports the creation of a TanStack Application using a specific technology (e.g. React, Solid, Vue, etc.)
- `code-router` - One of two _modes_ of TanStack Application. The other is `file-router`. The code router is when the applications routes are defined in code.
- `file-router` - One of two _modes_ of TanStack Application. The other is `code-router`. The file router is when the applications routes are defined in files (usually in the `src/routes` directory).
- `add-on` - A plugin that extends the capabilities of a TanStack Application (e.g. the `tanstack-query` add-on integrates TanStack Query into the application).
- custom `add-on` - An externalized `add-on` contained in a single JSON file that can integate technologies that aren't covered with the built-in add-ons.
- `starter` - An application template that is constructed from an existing CTA created application that has been modified to the customers needs. The advantage of a starter over a cloneable git repo is that when a starter is used the add-ons and project will be created using the latest version of the CTA framework and the add-ons. This reduces the versioning burden on the customer. This does come with a risk of potential breaking changes.

## CLI applications

- `create-tanstack` - The CLI application for creating a TanStack Application.
- `create-start-app` - The CLI application for creating a TanStack Start Application.
- `create-tsrouter-app` - The CLI application for creating a TanStack Router Application.

## Packages

- `@tanstack/cta-cli` - The command line interface for TanStack CTA.
- `@tanstack/cta-engine` - The core engine that powers TanStack CTA.
- `@tanstack/cta-ui` - The UI components for TanStack CTA.

## Frameworks

- `@tanstack/cta-frameworks-react-cra` - The React (Create React App) framework for TanStack CTA.
- `@tanstack/cta-frameworks-solid` - The Solid framework for TanStack CTA.

## File Templates

The CTA system uses EJS to render the files into the final application.

Below are all of the variables that are available to the file templates.

| Variable                     | Description                                                                                                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packageManager`             | The package manager that is being used (e.g. `npm`, `yarn`, `pnpm`)                                                                                                                                  |
| `projectName`                | The name of the project                                                                                                                                                                              |
| `typescript`                 | Boolean value that is `true` if TypeScript is being used, otherwise it is `false`                                                                                                                    |
| `tailwind`                   | Boolean value that is `true` if Tailwind CSS is being used, otherwise it is `false`. `Note`: Even if Tailwind CSS is set to false by the user during setup, it will be automatically enabled if any add-ons are selected, since all add-ons depend on Tailwind CSS                                                                                                                  |
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
| `ignoreFile`                 | A function that if called will tell CTA to not include this file in the application.                                                                                                                 |
