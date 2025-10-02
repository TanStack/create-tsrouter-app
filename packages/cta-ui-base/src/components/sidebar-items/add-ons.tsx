import { Fragment, useMemo, useState } from 'react'
import { InfoIcon } from 'lucide-react'

import { Switch } from '../ui/switch'
import { Label } from '../ui/label'

import { useAddOns } from '../../store/project'

import ImportCustomAddOn from '../custom-add-on-dialog'
import AddOnInfoDialog from '../add-on-info-dialog'

import type { AddOnInfo } from '../../types'

const addOnTypeLabels: Record<string, string> = {
  toolchain: 'Toolchain',
  'add-on': 'Add-on',
  host: 'Hosting Provider',
  example: 'Example',
}

export default function SelectedAddOns() {
  const { availableAddOns, addOnState, toggleAddOn } = useAddOns()

  const sortedAddOns = useMemo(() => {
    return availableAddOns.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
  }, [availableAddOns])

  const [infoAddOn, setInfoAddOn] = useState<AddOnInfo>()

  return (
    <>
      <AddOnInfoDialog
        addOn={infoAddOn}
        onClose={() => setInfoAddOn(undefined)}
      />
      {Object.keys(addOnTypeLabels).map((type) => (
        <Fragment key={type}>
          {sortedAddOns.filter((addOn) => addOn.type === type).length > 0 && (
            <div
              key={`${type}-add-ons`}
              className="block p-4 bg-gray-500/10 hover:bg-gray-500/20 rounded-lg transition-colors space-y-4 active"
            >
              <h3 className="font-medium">{addOnTypeLabels[type]}</h3>
              <div className="flex flex-row flex-wrap">
                {sortedAddOns
                  .filter((addOn) => addOn.type === type)
                  .map((addOn) => (
                    <div
                      key={addOn.id}
                      className="w-1/2 flex flex-row justify-between pr-4"
                    >
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
                          className="pl-2 font-semibold text-gray-300"
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
                        <InfoIcon
                          className="ml-2 w-4 text-gray-600"
                          onClick={() => setInfoAddOn(addOn)}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Fragment>
      ))}
      <div className="mt-4">
        <ImportCustomAddOn />
      </div>
    </>
  )
}
