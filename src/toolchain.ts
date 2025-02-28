export const SUPPORTED_TOOLCHAINS = ['none', 'biome'] as const
export type ToolChain = (typeof SUPPORTED_TOOLCHAINS)[number]
export const DEFAULT_TOOLCHAIN: ToolChain = 'none'
