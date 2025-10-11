import { Fragment, useMemo, useState } from 'react'
import { InfoIcon, SettingsIcon } from 'lucide-react'

import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Button } from '../ui/button'

import { useAddOns, useProjectOptions } from '../../store/project'

import ImportCustomAddOn from '../custom-add-on-dialog'
import AddOnInfoDialog from '../add-on-info-dialog'
import AddOnConfigDialog from '../add-on-config-dialog'

import type { AddOnInfo } from '../../types'

const addOnTypeLabels: Record<string, string> = {
  toolchain: 'Toolchain',
  'add-on': 'Add-on',
  host: 'Hosting Provider',
  example: 'Example',
}

export default function SelectedAddOns() {
  const { availableAddOns, addOnState, toggleAddOn, setAddOnOption } =
    useAddOns()
  const addOnOptions = useProjectOptions((state) => state.addOnOptions)

  const sortedAddOns = useMemo(() => {
    return availableAddOns.sort((a, b) => {
      const aPriority = a.priority ?? 0
      const bPriority = b.priority ?? 0
      if (bPriority !== aPriority) {
        return bPriority - aPriority // Higher priority first
      }
      return a.name.localeCompare(b.name) // Fallback to alphabetical
    })
  }, [availableAddOns])

  const [infoAddOn, setInfoAddOn] = useState<AddOnInfo>()
  const [configAddOn, setConfigAddOn] = useState<AddOnInfo>()

  return (
    <>
      <AddOnInfoDialog
        addOn={infoAddOn}
        onClose={() => setInfoAddOn(undefined)}
      />
      <AddOnConfigDialog
        addOn={configAddOn}
        selectedOptions={configAddOn ? addOnOptions[configAddOn.id] || {} : {}}
        onOptionChange={(optionName, value) => {
          if (configAddOn) {
            setAddOnOption(configAddOn.id, optionName, value)
          }
        }}
        onClose={() => setConfigAddOn(undefined)}
        disabled={configAddOn ? !addOnState[configAddOn.id]?.enabled : false}
      />
      <div className="max-h-[60vh] overflow-y-auto space-y-2">
        {Object.keys(addOnTypeLabels).map((type) => (
          <Fragment key={type}>
            {sortedAddOns.filter((addOn) => addOn.type === type).length > 0 && (
              <div
                key={`${type}-add-ons`}
                className="block p-4 bg-gray-500/10 hover:bg-gray-500/20 rounded-lg transition-colors space-y-4 active"
              >
                <h3 className="font-medium">{addOnTypeLabels[type]}</h3>
                <div className="space-y-3">
                  <div className="flex flex-row flex-wrap">
                    {sortedAddOns
                      .filter((addOn) => addOn.type === type)
                      .map((addOn) => (
                        <div key={addOn.id} className="w-1/2">
                          <div className="flex flex-row items-center justify-between">
                            <div className="p-1 flex flex-row items-center">
                              <Switch
                                id={addOn.id}
                                checked={addOnState[addOn.id].selected}
                                disabled={!addOnState[addOn.id].enabled}
                                onCheckedChange={() => {
                                  toggleAddOn(addOn.id)
                                }}
                              />
                              <Label
                                htmlFor={addOn.id}
                                className="pl-2 font-semibold text-gray-300 flex items-center gap-2"
                              >
                                {addOn.smallLogo && (
                                  <img
                                    src={`data:image/svg+xml,${encodeURIComponent(
                                      addOn.smallLogo,
                                    )}`}
                                    alt={addOn.name}
                                    className="w-5"
                                  />
                                )}
                                {addOn.name}
                              </Label>
                            </div>
                            <div className="flex items-center gap-1">
                              {addOnState[addOn.id].selected &&
                                addOn.options &&
                                Object.keys(addOn.options).length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-gray-600 hover:text-gray-400"
                                    onClick={() => setConfigAddOn(addOn)}
                                    disabled={!addOnState[addOn.id].enabled}
                                  >
                                    <SettingsIcon className="w-4 h-4" />
                                  </Button>
                                )}
                              <InfoIcon
                                className="w-4 text-gray-600 cursor-pointer hover:text-gray-400"
                                onClick={() => setInfoAddOn(addOn)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </Fragment>
        ))}
      </div>
      <div className="mt-4">
        <ImportCustomAddOn />
      </div>
    </>
  )
}
