export type Provider = 'openai' | 'anthropic' | 'gemini' | 'ollama'

export interface ModelOption {
  provider: Provider
  model: string
  label: string
}

export const MODEL_OPTIONS: Array<ModelOption> = [
  // OpenAI models
  { provider: 'openai', model: 'gpt-4o', label: 'OpenAI - GPT-4o' },
  { provider: 'openai', model: 'gpt-4o-mini', label: 'OpenAI - GPT-4o Mini' },

  // Anthropic models
  {
    provider: 'anthropic',
    model: 'claude-haiku-4-5',
    label: 'Anthropic - Claude Haiku 4.5',
  },
  {
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929',
    label: 'Anthropic - Claude Sonnet 4.5',
  },

  // Gemini models
  {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    label: 'Gemini - 2.0 Flash',
  },

  // Ollama models
  { provider: 'ollama', model: 'mistral:7b', label: 'Ollama - Mistral 7B' },
]

const STORAGE_KEY = 'tanstack-ai-model-preference'

export function getStoredModelPreference(): ModelOption | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validate that the stored option still exists in MODEL_OPTIONS
      const found = MODEL_OPTIONS.find(
        (o) => o.provider === parsed.provider && o.model === parsed.model,
      )
      if (found) return found
    }
  } catch {
    // Ignore storage errors
  }
  return null
}

export function setStoredModelPreference(option: ModelOption): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(option))
  } catch {
    // Ignore storage errors
  }
}

export function getDefaultModelOption(): ModelOption {
  return getStoredModelPreference() || MODEL_OPTIONS[0]
}

export function getModelOptionsForProvider(provider: Provider): ModelOption[] {
  return MODEL_OPTIONS.filter((o) => o.provider === provider)
}

export function getAvailableModelOptions(
  availableProviders: Provider[],
): ModelOption[] {
  return MODEL_OPTIONS.filter((o) => availableProviders.includes(o.provider))
}
