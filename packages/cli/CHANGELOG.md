# @tanstack/cli

## 0.55.0

### Minor Changes

- feat(mcp): add getAddOnDetails tool and expand add-on metadata

  Add new MCP tool to retrieve detailed add-on information including
  routes, package additions, files, and documentation. Also expand
  listTanStackAddOns to include type, category, link, warning, and
  exclusive fields.

- feat: case-insensitive add-on lookup with typo suggestions

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

- ci: Version Packages (#325)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#335)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#312)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#326)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#311)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#313)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>
  Co-authored-by: Tanner Linsley <tannerlinsley@gmail.com>

- ci: Version Packages (#334)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#327)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- Updated dependencies []:
  - @tanstack/create@0.56.0
  - @tanstack/create-ui@0.55.0

## 0.54.0

### Minor Changes

- feat(mcp): add getAddOnDetails tool and expand add-on metadata

  Add new MCP tool to retrieve detailed add-on information including
  routes, package additions, files, and documentation. Also expand
  listTanStackAddOns to include type, category, link, warning, and
  exclusive fields.

- feat: case-insensitive add-on lookup with typo suggestions

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

- ci: Version Packages (#327)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#313)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>
  Co-authored-by: Tanner Linsley <tannerlinsley@gmail.com>

- ci: Version Packages (#326)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#311)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#312)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#334)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- ci: Version Packages (#325)

  Co-authored-by: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

- Updated dependencies []:
  - @tanstack/create@0.55.0
  - @tanstack/create-ui@0.54.0

## 0.53.0

### Minor Changes

- feat(mcp): add getAddOnDetails tool and expand add-on metadata

  Add new MCP tool to retrieve detailed add-on information including
  routes, package additions, files, and documentation. Also expand
  listTanStackAddOns to include type, category, link, warning, and
  exclusive fields.

- feat: case-insensitive add-on lookup with typo suggestions

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
  - @tanstack/create@0.54.0
  - @tanstack/create-ui@0.53.0

## 0.52.2

### Patch Changes

- Add case-insensitive add-on ID matching and "did you mean?" suggestions for typos ([`61011ec`](https://github.com/TanStack/cli/commit/61011ec171283cd6de020e2cb6ac9f943a3aa47b))

- Updated dependencies [[`61011ec`](https://github.com/TanStack/cli/commit/61011ec171283cd6de020e2cb6ac9f943a3aa47b), [`2cf6703`](https://github.com/TanStack/cli/commit/2cf6703a082d0441f96f599eab21559b05742f92), [`46a4903`](https://github.com/TanStack/cli/commit/46a49033547f7e6c9905f4e94cca07ce0988f63a)]:
  - @tanstack/create@0.53.2
  - @tanstack/create-ui@0.52.2

## 0.52.1

### Patch Changes

- Updated dependencies [[`72049cb`](https://github.com/TanStack/cli/commit/72049cb134f9ecd169da161154899cc84a5c39b8)]:
  - @tanstack/create@0.53.1
  - @tanstack/create-ui@0.52.1

## 0.52.0

### Minor Changes

- force tailwind, force typescript ([`337eeba`](https://github.com/TanStack/cli/commit/337eebaafa190de96194910b6c8c9e550ca142fc))

### Patch Changes

- Updated dependencies [[`337eeba`](https://github.com/TanStack/cli/commit/337eebaafa190de96194910b6c8c9e550ca142fc)]:
  - @tanstack/create-ui@0.52.0
  - @tanstack/create@0.53.0

## 0.51.0

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
  - @tanstack/create@0.52.0
  - @tanstack/create-ui@0.51.0

## 0.50.0

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
  - @tanstack/create@0.51.0
  - @tanstack/create-ui@0.50.0

## 0.49.0

### Minor Changes

- feat(mcp): add getAddOnDetails tool and expand add-on metadata

  Add new MCP tool to retrieve detailed add-on information including
  routes, package additions, files, and documentation. Also expand
  listTanStackAddOns to include type, category, link, warning, and
  exclusive fields.

### Patch Changes

- Updated dependencies []:
  - @tanstack/create@0.50.0
  - @tanstack/create-ui@0.49.0

## 0.48.7

### Patch Changes

- Updated dependencies [[`30edd20`](https://github.com/TanStack/cli/commit/30edd208fd81b5c501fa42cd476232273ff108d1)]:
  - @tanstack/create@0.49.3
  - @tanstack/create-ui@0.48.5

## 0.48.6

### Patch Changes

- Updated dependencies [[`7940300`](https://github.com/TanStack/cli/commit/79403004689817339ec6f6e03c20fb25e841ddb0)]:
  - @tanstack/create@0.49.2
  - @tanstack/create-ui@0.48.4
