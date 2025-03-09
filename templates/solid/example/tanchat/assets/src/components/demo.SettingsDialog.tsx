import { PlusCircle, Trash2 } from 'lucide-solid'
import { useAppActions, useAppState } from '../store/demo.hooks'
import { createSignal } from 'solid-js'

interface SettingsDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function SettingsDialog(props: SettingsDialogProps) {
    const [promptForm, setPromptForm] = createSignal({ name: '', content: '' })
    const [isAddingPrompt, setIsAddingPrompt] = createSignal(false)
    const state = useAppState()
    const actions = useAppActions();

    const handleAddPrompt = () => {
        if (!promptForm.name.trim() || !promptForm().content.trim()) return
        actions.createPrompt(promptForm().name, promptForm().content)
        setPromptForm({ name: '', content: '' })
        setIsAddingPrompt(false)
    }

    const handleClose = () => {
        props.onClose()
        setIsAddingPrompt(false)
        setPromptForm({ name: '', content: '' })
    }

    if (!props.isOpen) return null

    return (
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
        }}>
            <div class="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-semibold text-white">Settings</h2>
                        <button
                            onClick={handleClose}
                            class="text-gray-400 hover:text-white focus:outline-none"
                        >
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="space-y-6">
                        {/* Prompts Management */}
                        <div class="space-y-2">
                            <div class="flex items-center justify-between mb-4">
                                <label class="block text-sm font-medium text-white">
                                    System Prompts
                                </label>
                                <button
                                    onClick={() => setIsAddingPrompt(true)}
                                    class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <PlusCircle class="w-4 h-4" />
                                    Add Prompt
                                </button>
                            </div>

                            {isAddingPrompt() && (
                                <div class="space-y-3 mb-4 p-3 bg-gray-700/50 rounded-lg">
                                    <input
                                        type="text"
                                        value={promptForm().name}
                                        onChange={(e) => setPromptForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Prompt name..."
                                        class="w-full px-3 py-2 text-sm text-white bg-gray-700 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    />
                                    <textarea
                                        value={promptForm().content}
                                        onChange={(e) => setPromptForm(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Enter prompt content..."
                                        class="w-full h-32 px-3 py-2 text-sm text-white bg-gray-700 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    />
                                    <div class="flex justify-end gap-2">
                                        <button
                                            onClick={() => setIsAddingPrompt(false)}
                                            class="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white focus:outline-none"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddPrompt}
                                            class="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                                            Save Prompt
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div class="space-y-2">
                                {state().prompts.map((prompt) => (
                                    <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                        <div class="flex-1 min-w-0 mr-4">
                                            <h4 class="text-sm font-medium text-white truncate">{prompt.name}</h4>
                                            <p class="text-xs text-gray-400 truncate">{prompt.content}</p>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <label class="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    class="sr-only peer"
                                                    checked={prompt.is_active}
                                                    onChange={() => actions.setPromptActive(prompt.id, !prompt.is_active)}
                                                />
                                                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                            </label>
                                            <button
                                                onClick={() => actions.deletePrompt(prompt.id)}
                                                class="p-1 text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 class="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p class="text-xs text-gray-400">
                                Create and manage custom system prompts. Only one prompt can be active at a time.
                            </p>
                        </div>

                    </div>

                    <div class="mt-6 flex justify-end gap-3">
                        <button
                            onClick={handleClose}
                            class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleClose}
                            class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
