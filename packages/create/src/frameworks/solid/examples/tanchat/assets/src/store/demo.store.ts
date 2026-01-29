import { Store } from '@tanstack/store'
import type { Message } from '../utils/demo.ai'

// Types
export interface Prompt {
  id: string
  name: string
  content: string
  is_active: boolean
  created_at: number
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
}

export interface State {
  prompts: Prompt[]
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
}

const initialState: State = {
  prompts: [],
  conversations: [],
  currentConversationId: null,
  isLoading: false
}

export const store = new Store<State>(initialState)

export const actions = {
  // Prompt actions
  createPrompt: (name: string, content: string) => {
    const id = Date.now().toString()
    store.setState(state => {
      const updatedPrompts = state.prompts.map(p => ({ ...p, is_active: false }))
      return {
        ...state,
        prompts: [
          ...updatedPrompts,
          {
            id,
            name,
            content,
            is_active: true,
            created_at: Date.now()
          }
        ]
      }
    })
  },

  deletePrompt: (id: string) => {
    store.setState(state => ({
      ...state,
      prompts: state.prompts.filter(p => p.id !== id)
    }))
  },

  setPromptActive: (id: string, shouldActivate: boolean) => {
    store.setState(state => ({
      ...state,
      prompts: state.prompts.map(p => ({
        ...p,
        is_active: p.id === id ? shouldActivate : false
      }))
    }))
  },

  // Chat actions
  setConversations: (conversations: Conversation[]) => {
    store.setState(state => ({ ...state, conversations }))
  },

  setCurrentConversationId: (id: string | null) => {
    store.setState(state => ({ ...state, currentConversationId: id }))
  },

  addConversation: (conversation: Conversation) => {
    store.setState(state => ({
      ...state,
      conversations: [...state.conversations, conversation],
      currentConversationId: conversation.id
    }))
  },

  updateConversationTitle: (id: string, title: string) => {
    store.setState(state => ({
      ...state,
      conversations: state.conversations.map(conv =>
        conv.id === id ? { ...conv, title } : conv
      )
    }))
  },

  deleteConversation: (id: string) => {
    store.setState(state => ({
      ...state,
      conversations: state.conversations.filter(conv => conv.id !== id),
      currentConversationId: state.currentConversationId === id ? null : state.currentConversationId
    }))
  },

  addMessage: (conversationId: string, message: Message) => {
    store.setState(state => ({
      ...state,
      conversations: state.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      )
    }))
  },

  setLoading: (isLoading: boolean) => {
    store.setState(state => ({ ...state, isLoading }))
  }
}

// Selectors
export const selectors = {
  getActivePrompt: (state: State) => state.prompts.find(p => p.is_active),
  getCurrentConversation: (state: State) => 
    state.conversations.find(c => c.id === state.currentConversationId),
  getPrompts: (state: State) => state.prompts,
  getConversations: (state: State) => state.conversations,
  getCurrentConversationId: (state: State) => state.currentConversationId,
  getIsLoading: (state: State) => state.isLoading
} 