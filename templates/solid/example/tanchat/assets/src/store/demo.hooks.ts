import { useStore } from '@tanstack/solid-store'
import { store, actions, selectors } from './demo.store'

export type { State, Prompt, Conversation } from './demo.store'

export function useAppState() {
  const state = useStore(store)
  return state;
}

export function useAppActions() {
  return actions
}

export function useAppSelectors() {
  return selectors
} 