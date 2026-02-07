# create-tanstack

## 0.48.0

### Minor Changes

- feat(mcp): add getAddOnDetails tool and expand add-on metadata

  Add new MCP tool to retrieve detailed add-on information including
  routes, package additions, files, and documentation. Also expand
  listTanStackAddOns to include type, category, link, warning, and
  exclusive fields.

- feat: force TanStack Start with Tailwind CSS always enabled

  - Remove code-router mode and --router-only flag (TanStack Start only)
  - Remove start add-on (baked into base templates)
  - Remove module-federation add-on
  - Force Tailwind CSS to always be enabled
  - Remove --tailwind/--no-tailwind CLI flags
  - Remove selectTailwind and selectTypescript prompts
  - Remove forcedMode parameter (mode always file-router)
  - Simplify template conditionals and hardcode typescript/tailwind values
  - Update README.md.ejs with instructions for removing Tailwind
  - Clean up dead code and unused functions
  - Update all CLI wrappers to show deprecation warnings

### Patch Changes

- ci: Version Packages (#313)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>
  Co-authored-by: Tanner Linsley <tannerlinsley@gmail.com>

- ci: Version Packages (#325)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#326)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#327)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#311)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#312)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- Updated dependencies []:
  - @tanstack/cli@0.53.0
  - @tanstack/create@0.54.0

## 0.47.2

### Patch Changes

- Updated dependencies [[`61011ec`](https://github.com/TanStack/cli/commit/61011ec171283cd6de020e2cb6ac9f943a3aa47b), [`2cf6703`](https://github.com/TanStack/cli/commit/2cf6703a082d0441f96f599eab21559b05742f92), [`46a4903`](https://github.com/TanStack/cli/commit/46a49033547f7e6c9905f4e94cca07ce0988f63a)]:
  - @tanstack/cli@0.52.2
  - @tanstack/create@0.53.2

## 0.47.1

### Patch Changes

- Updated dependencies [[`72049cb`](https://github.com/TanStack/cli/commit/72049cb134f9ecd169da161154899cc84a5c39b8)]:
  - @tanstack/create@0.53.1
  - @tanstack/cli@0.52.1

## 0.47.0

### Minor Changes

- force tailwind, force typescript ([`337eeba`](https://github.com/TanStack/cli/commit/337eebaafa190de96194910b6c8c9e550ca142fc))

### Patch Changes

- Updated dependencies [[`337eeba`](https://github.com/TanStack/cli/commit/337eebaafa190de96194910b6c8c9e550ca142fc)]:
  - @tanstack/create@0.53.0
  - @tanstack/cli@0.52.0

## 0.46.0

### Minor Changes

- feat(mcp): add getAddOnDetails tool and expand add-on metadata

  Add new MCP tool to retrieve detailed add-on information including
  routes, package additions, files, and documentation. Also expand
  listTanStackAddOns to include type, category, link, warning, and
  exclusive fields.

### Patch Changes

- ci: Version Packages (#311)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#312)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- Updated dependencies []:
  - @tanstack/cli@0.51.0
  - @tanstack/create@0.52.0

## 0.45.0

### Minor Changes

- feat(mcp): add getAddOnDetails tool and expand add-on metadata

  Add new MCP tool to retrieve detailed add-on information including
  routes, package additions, files, and documentation. Also expand
  listTanStackAddOns to include type, category, link, warning, and
  exclusive fields.

### Patch Changes

- ci: Version Packages (#311)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- Updated dependencies []:
  - @tanstack/cli@0.50.0
  - @tanstack/create@0.51.0

## 0.44.0

### Minor Changes

- feat(mcp): add getAddOnDetails tool and expand add-on metadata

  Add new MCP tool to retrieve detailed add-on information including
  routes, package additions, files, and documentation. Also expand
  listTanStackAddOns to include type, category, link, warning, and
  exclusive fields.

### Patch Changes

- Updated dependencies []:
  - @tanstack/cli@0.49.0
  - @tanstack/create@0.50.0

## 0.43.8

### Patch Changes

- Updated dependencies [[`30edd20`](https://github.com/TanStack/cli/commit/30edd208fd81b5c501fa42cd476232273ff108d1)]:
  - @tanstack/create@0.49.3
  - @tanstack/cli@0.48.7

## 0.43.7

### Patch Changes

- Updated dependencies [[`7940300`](https://github.com/TanStack/cli/commit/79403004689817339ec6f6e03c20fb25e841ddb0)]:
  - @tanstack/create@0.49.2
  - @tanstack/cli@0.48.6

## 0.43.2

### Patch Changes

- Updated dependencies []:
  - @tanstack/cta-framework-react-cra@0.48.2
  - @tanstack/cta-framework-solid@0.48.2
  - @tanstack/cta-cli@0.48.2

## 0.43.1

### Patch Changes

- Updated dependencies []:
  - @tanstack/cta-framework-react-cra@0.48.1
  - @tanstack/cta-framework-solid@0.48.1
  - @tanstack/cta-cli@0.48.1

## 0.43.0

### Minor Changes

- no will prompt about overriding a directory that has contents ([#289](https://github.com/TanStack/create-tsrouter-app/pull/289))

### Patch Changes

- Updated dependencies [[`3087532`](https://github.com/TanStack/create-tsrouter-app/commit/308753249af11bf5c9e374789e973a934c753520)]:
  - @tanstack/cta-cli@0.48.0
  - @tanstack/cta-framework-react-cra@0.48.0
  - @tanstack/cta-framework-solid@0.48.0

## 0.42.0

### Minor Changes

- Smakll content fixes ([`7647683`](https://github.com/TanStack/create-tsrouter-app/commit/76476838fc427d71535881b959530307ca4664a2))

- allowing for no tailwind ([#151](https://github.com/TanStack/create-tsrouter-app/pull/151))

### Patch Changes

- Updated dependencies [[`7647683`](https://github.com/TanStack/create-tsrouter-app/commit/76476838fc427d71535881b959530307ca4664a2), [`f1f58fe`](https://github.com/TanStack/create-tsrouter-app/commit/f1f58feed7d7df1e0c5e0fc4dd3af02e11df09e5)]:
  - @tanstack/cta-framework-react-cra@0.47.0
  - @tanstack/cta-framework-solid@0.47.0
  - @tanstack/cta-cli@0.47.0
