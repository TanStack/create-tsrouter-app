export const SUPPORTED_TOOLCHAINS = [
  'none',
  'biome',
  'eslint+prettier',
] as const
export type ToolChain = (typeof SUPPORTED_TOOLCHAINS)[number]
export const DEFAULT_TOOLCHAIN: ToolChain = 'none'
