import { useCallback, useEffect, useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useQuery } from '@tanstack/react-query'

import { dryRunAddToApp, dryRunCreateApp, loadInitialData } from '../lib/api'

import { getAddOnStatus } from './add-ons'

import type { SerializedOptions } from '@tanstack/cta-engine'

import type { AddOnInfo, DryRunOutput, StarterInfo } from '../types'

export const useProjectOptions = create<
  SerializedOptions & { initialized: boolean }
>(() => ({
  initialized: false,
  framework: '',
  mode: '',
  projectName: '',
  targetDir: '',
  typescript: true,
  tailwind: true,
  git: true,
  chosenAddOns: [],
  addOnOptions: {},
  packageManager: 'pnpm',
}))

const useInitialData = () =>
  useQuery({
    queryKey: ['initial-data'],
    queryFn: loadInitialData,
  })

export const useReady = () => {
  const { data } = useInitialData()
  return data !== undefined
}

const useForcedRouterMode = () => useInitialData().data?.forcedRouterMode
const useForcedAddOns = () => useInitialData().data?.forcedAddOns

export const useRegistry = () => useInitialData().data?.registry
export const useProjectLocalFiles = () => useInitialData().data?.localFiles
export const useOriginalOutput = () => useInitialData().data?.output
export const useOriginalOptions = () => useInitialData().data?.options
export const useOriginalSelectedAddOns = () =>
  useOriginalOptions()?.chosenAddOns
export const useApplicationMode = () => useInitialData().data?.applicationMode
export const useShowDeploymentOptions = () =>
  useInitialData().data?.showDeploymentOptions
export const useAddOnsByMode = () => useInitialData().data?.addOns
export const useSupportedModes = () => useInitialData().data?.supportedModes

const useApplicationSettings = create<{
  includeFiles: Array<string>
}>(() => ({
  includeFiles: ['unchanged', 'added', 'modified', 'deleted', 'overwritten'],
}))

const useMutableAddOns = create<{
  userSelectedAddOns: Array<string>
  customAddOns: Array<AddOnInfo>
}>(() => ({
  userSelectedAddOns: [],
  customAddOns: [],
}))

export const useProjectStarter = create<{
  projectStarter: StarterInfo | undefined
}>(() => ({
  projectStarter: undefined,
}))

export function addCustomAddOn(addOn: AddOnInfo) {
  useMutableAddOns.setState((state) => ({
    customAddOns: [...state.customAddOns, addOn],
  }))
  if (addOn.modes.includes(useProjectOptions.getState().mode)) {
    useMutableAddOns.setState((state) => ({
      userSelectedAddOns: [...state.userSelectedAddOns, addOn.id],
    }))
  }
}

export function useAddOns() {
  const ready = useReady()

  const routerMode = useRouterMode()
  const originalSelectedAddOns = useOriginalSelectedAddOns()
  const addOnsByMode = useAddOnsByMode()
  const forcedAddOns = useForcedAddOns()
  const { userSelectedAddOns, customAddOns } = useMutableAddOns()
  const projectStarter = useProjectStarter().projectStarter

  const availableAddOns = useMemo(() => {
    if (!ready) return []
    const baseAddOns = addOnsByMode?.[routerMode] || []
    return [
      ...baseAddOns,
      ...customAddOns.filter((addOn) => addOn.modes.includes(routerMode)),
    ]
  }, [ready, routerMode, addOnsByMode, customAddOns])

  const addOnState = useMemo(() => {
    if (!ready) return {}
    const originalAddOns: Set<string> = new Set()
    for (const addOn of projectStarter?.dependsOn || []) {
      originalAddOns.add(addOn)
    }
    for (const addOn of originalSelectedAddOns) {
      originalAddOns.add(addOn)
    }
    for (const addOn of forcedAddOns || []) {
      originalAddOns.add(addOn)
    }
    return getAddOnStatus(
      availableAddOns,
      userSelectedAddOns,
      Array.from(originalAddOns),
    )
  }, [
    ready,
    availableAddOns,
    userSelectedAddOns,
    originalSelectedAddOns,
    projectStarter?.dependsOn,
    forcedAddOns,
  ])

  const chosenAddOns = useMemo(() => {
    if (!ready) return []
    const addOns = new Set(
      Object.keys(addOnState).filter((addOn) => addOnState[addOn].selected),
    )
    for (const addOn of forcedAddOns || []) {
      addOns.add(addOn)
    }
    return Array.from(addOns)
  }, [ready, addOnState, forcedAddOns])

  const toggleAddOn = useCallback(
    (addOnId: string) => {
      if (!ready) return

      if (addOnState[addOnId].isSingleSelect) {
        if (!addOnState[addOnId].selected) {
          // Find the currently selected addOn with the same isSingleSelect value and unselect it
          const singleSelectType = addOnState[addOnId].isSingleSelect
          const currentlySelected = Object.keys(addOnState).find(
            (id) =>
              id !== addOnId &&
              addOnState[id].isSingleSelect === singleSelectType &&
              addOnState[id].selected,
          )
          useMutableAddOns.setState((state) => {
            let newUserSelectedAddOns = state.userSelectedAddOns.filter(
              (id) => id !== currentlySelected, // remove the previously selected one
            )
            if (!newUserSelectedAddOns.includes(addOnId)) {
              newUserSelectedAddOns = [...newUserSelectedAddOns, addOnId]
            }
            return {
              userSelectedAddOns: newUserSelectedAddOns,
            }
          })
        }
      } else {
        if (addOnState[addOnId].enabled) {
          if (addOnState[addOnId].selected) {
            useMutableAddOns.setState((state) => ({
              userSelectedAddOns: state.userSelectedAddOns.filter(
                (addOn) => addOn !== addOnId,
              ),
            }))
          } else {
            useMutableAddOns.setState((state) => ({
              userSelectedAddOns: [...state.userSelectedAddOns, addOnId],
            }))
          }
        }
      }
    },
    [ready, addOnState, availableAddOns],
  )

  const setAddOnOption = useCallback(
    (addOnId: string, optionName: string, value: any) => {
      if (!ready) return
      useProjectOptions.setState((state) => ({
        addOnOptions: {
          ...state.addOnOptions,
          [addOnId]: {
            ...state.addOnOptions[addOnId],
            [optionName]: value,
          },
        },
      }))
    },
    [ready],
  )

  const getAddOnOptions = useCallback((addOnId: string) => {
    return useProjectOptions.getState().addOnOptions[addOnId] || {}
  }, [])

  return {
    toggleAddOn,
    setAddOnOption,
    getAddOnOptions,
    chosenAddOns,
    availableAddOns,
    userSelectedAddOns,
    originalSelectedAddOns,
    addOnState,
  }
}

const useHasProjectStarter = () =>
  useProjectStarter((state) => state.projectStarter === undefined)

export const useModeEditable = () => {
  const ready = useReady()
  const forcedRouterMode = useForcedRouterMode()
  const hasProjectStarter = useHasProjectStarter()
  return ready ? !forcedRouterMode && hasProjectStarter : false
}

export const useTypeScriptEditable = () => {
  const ready = useReady()
  const hasProjectStarter = useHasProjectStarter()
  const routerMode = useRouterMode()
  return ready ? hasProjectStarter && routerMode === 'code-router' : false
}

export const useTailwindEditable = () => {
  const ready = useReady()
  const hasProjectStarter = useHasProjectStarter()
  const routerMode = useRouterMode()
  return ready ? hasProjectStarter && routerMode === 'code-router' : false
}

export const useProjectName = () =>
  useProjectOptions((state) => state.projectName)

export const useRouterMode = () => {
  const ready = useReady()
  const forcedRouterMode = useForcedRouterMode()
  const userMode = useProjectOptions((state) => state.mode)
  return ready ? forcedRouterMode || userMode : 'file-router'
}

export function useFilters() {
  const ready = useReady()
  const includedFiles = useApplicationSettings((state) => state.includeFiles)

  const toggleFilter = useCallback(
    (filter: string) => {
      if (!ready) return
      useApplicationSettings.setState((state) => ({
        includeFiles: state.includeFiles.includes(filter)
          ? state.includeFiles.filter((f) => f !== filter)
          : [...state.includeFiles, filter],
      }))
    },
    [ready],
  )

  return {
    includedFiles,
    toggleFilter,
  }
}

export function useDryRun() {
  const ready = useReady()
  const applicationMode = useApplicationMode()
  const { initialized, ...projectOptions } = useProjectOptions()
  const { userSelectedAddOns, chosenAddOns } = useAddOns()
  const projectStarter = useProjectStarter().projectStarter

  const { data: dryRunOutput } = useQuery<DryRunOutput>({
    queryKey: [
      'dry-run',
      applicationMode,
      JSON.stringify(projectOptions),
      JSON.stringify(userSelectedAddOns),
      projectStarter?.url,
    ],
    queryFn: async () => {
      if (applicationMode === 'none' || !ready || !initialized) {
        return {
          files: {},
          commands: [],
          deletedFiles: [],
        }
      } else if (applicationMode === 'setup') {
        return dryRunCreateApp(projectOptions, chosenAddOns, projectStarter)
      } else {
        return dryRunAddToApp(userSelectedAddOns)
      }
    },
    enabled: ready,
    initialData: {
      files: {},
      commands: [],
      deletedFiles: [],
    },
  })

  return dryRunOutput
}

type StartupDialogState = {
  open: boolean
  dontShowAgain: boolean
  setOpen: (open: boolean) => void
  setDontShowAgain: (dontShowAgain: boolean) => void
}

export const useStartupDialog = create<StartupDialogState>()(
  persist(
    (set) => ({
      open: false,
      dontShowAgain: false,
      setOpen: (open) => set({ open }),
      setDontShowAgain: (dontShowAgain) => set({ dontShowAgain }),
    }),
    {
      name: 'startup-dialog',
      partialize: (state) => ({
        dontShowAgain: state.dontShowAgain,
      }),
      merge: (persistedState: unknown, currentState) => {
        if (
          persistedState &&
          (persistedState as { dontShowAgain?: boolean }).dontShowAgain
        ) {
          currentState.open = false
        } else {
          currentState.open = true
        }
        return currentState
      },
    },
  ),
)

export const setProjectName = (projectName: string) =>
  useProjectOptions.setState({
    projectName,
  })

export const setRouterMode = (mode: string) =>
  useProjectOptions.setState({
    mode,
  })

export function setTypeScript(typescript: boolean) {
  useProjectOptions.setState({
    typescript,
  })
}

export function setTailwind(tailwind: boolean) {
  useProjectOptions.setState({
    tailwind,
  })
}

export function setProjectStarter(starter: StarterInfo | undefined) {
  useProjectStarter.setState(() => ({
    projectStarter: starter,
  }))
  if (starter) {
    useProjectOptions.setState({
      mode: starter.mode,
    })
  }
}

export function useManager() {
  const ready = useReady()
  const originalOptions = useOriginalOptions()

  useEffect(() => {
    if (ready) {
      useProjectOptions.setState({
        ...originalOptions,
        initialized: true,
      })
    }
  }, [ready])
}
