import { loadRemoteAddOn } from './custom-add-ons/add-on.js'

import type { AddOn, Framework } from './types.js'

export function getAllAddOns(framework: Framework, mode: string): Array<AddOn> {
  return framework.getAddOns().filter((a) => a.modes.includes(mode))
}

// Turn the list of chosen add-on IDs into a final list of add-ons by resolving dependencies
export async function finalizeAddOns(
  framework: Framework,
  mode: string,
  chosenAddOnIDs: Array<string>,
): Promise<Array<AddOn>> {
  const finalAddOnIDs = new Set(chosenAddOnIDs)

  const addOns = getAllAddOns(framework, mode)

  for (const addOnID of finalAddOnIDs) {
    let addOn: AddOn | undefined
    const localAddOn = addOns.find((a) => a.id === addOnID)
    if (localAddOn) {
      addOn = loadAddOn(localAddOn)
    } else if (addOnID.startsWith('http')) {
      addOn = await loadRemoteAddOn(addOnID)
      addOns.push(addOn)
    } else {
      throw new Error(`Add-on ${addOnID} not found`)
    }

    for (const dependsOn of addOn.dependsOn || []) {
      const dep = addOns.find((a) => a.id === dependsOn)
      if (!dep) {
        throw new Error(`Dependency ${dependsOn} not found`)
      }
      finalAddOnIDs.add(dep.id)
    }
  }

  const finalAddOns = [...finalAddOnIDs].map(
    (id) => addOns.find((a) => a.id === id)!,
  )

  return finalAddOns
}

function loadAddOn(addOn: AddOn): AddOn {
  return addOn
}

export function populateAddOnOptionsDefaults(
  chosenAddOns: Array<AddOn>
): Record<string, Record<string, any>> {
  const addOnOptions: Record<string, Record<string, any>> = {}
  
  for (const addOn of chosenAddOns) {
    if (addOn.options) {
      const defaults: Record<string, any> = {}
      for (const [optionKey, optionDef] of Object.entries(addOn.options)) {
        defaults[optionKey] = optionDef.default
      }
      addOnOptions[addOn.id] = defaults
    }
  }
  
  return addOnOptions
}
