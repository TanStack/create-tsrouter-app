import type { AddOnInfo } from '../types'

export function getAddOnStatus(
  availableAddOns: Array<AddOnInfo>,
  chosenAddOns: Array<string>,
  originalAddOns: Array<string>,
) {
  const addOnMap = new Map<
    string,
    {
      enabled: boolean
      selected: boolean
      dependedUpon: boolean
    }
  >()

  for (const addOn of availableAddOns) {
    addOnMap.set(addOn.id, {
      selected: false,
      enabled: true,
      dependedUpon: false,
    })
  }

  // Guard against cycles in the dependency graph. The results won't be great. But it won't crash.
  function cycleGuardedSelectAndDisableDependsOn(startingAddOnId: string) {
    const visited = new Set<string>()
    function selectAndDisableDependsOn(addOnId: string) {
      if (visited.has(addOnId)) {
        return
      }
      visited.add(addOnId)
      const selectedAddOn = availableAddOns.find(
        (addOn) => addOn.id === addOnId,
      )
      if (selectedAddOn) {
        for (const dependsOnId of selectedAddOn.dependsOn || []) {
          const dependsOnAddOn = addOnMap.get(dependsOnId)
          if (dependsOnAddOn) {
            dependsOnAddOn.selected = true
            dependsOnAddOn.enabled = false
            dependsOnAddOn.dependedUpon = true
            selectAndDisableDependsOn(dependsOnId)
          }
        }
        const addOn = addOnMap.get(addOnId)
        if (addOn) {
          addOn.selected = true
          if (!addOn.dependedUpon) {
            addOn.enabled = true
          }
        }
      }
    }
    selectAndDisableDependsOn(startingAddOnId)
  }

  for (const addOn of originalAddOns) {
    const addOnInfo = addOnMap.get(addOn)
    if (addOnInfo) {
      addOnInfo.selected = true
      addOnInfo.enabled = false
      addOnInfo.dependedUpon = true
    }
    cycleGuardedSelectAndDisableDependsOn(addOn)
  }

  for (const addOnId of chosenAddOns) {
    cycleGuardedSelectAndDisableDependsOn(addOnId)
  }

  return Object.fromEntries(
    Array.from(addOnMap.entries()).map(([v, addOn]) => [
      v,
      {
        enabled: addOn.enabled,
        selected: addOn.selected,
      },
    ]),
  )
}
