import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import Typescript from '../icons/typescript'
import Tailwind from '../icons/tailwind'

import {
  setTailwind,
  setTypeScript,
  useApplicationMode,
  useProjectOptions,
  useTailwindEditable,
  useTypeScriptEditable,
} from '../../store/project'

import SidebarContainer from './sidebar-container'

export default function TypescriptSwitch() {
  const typescript = useProjectOptions((state) => state.typescript)
  const tailwind = useProjectOptions((state) => state.tailwind)
  const mode = useApplicationMode()
  const enableTailwind = useTailwindEditable()
  const enableTypeScript = useTypeScriptEditable()

  if (mode !== 'setup') {
    return null
  }

  return (
    <SidebarContainer>
      <div className="flex">
        <div className="w-1/2 flex flex-row items-center justify-center">
          <Switch
            id="typescript-switch"
            checked={typescript}
            onCheckedChange={(checked) => setTypeScript(checked)}
            disabled={!enableTypeScript}
          />
          <Label htmlFor="typescript-switch" className="ml-2">
            <Typescript className="w-5" />
            TypeScript
          </Label>
        </div>
        <div className="w-1/2 flex flex-row items-center justify-center">
          <Switch
            id="tailwind-switch"
            checked={tailwind}
            onCheckedChange={(checked) => setTailwind(checked)}
            disabled={!enableTailwind}
          />
          <Label htmlFor="tailwind-switch" className="ml-2">
            <Tailwind className="w-5" />
            Tailwind
          </Label>
        </div>
      </div>
    </SidebarContainer>
  )
}
