import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import Typescript from '../icons/typescript'

import {
  setTypeScript,
  useApplicationMode,
  useProjectOptions,
  useTypeScriptEditable,
} from '../../store/project'

import SidebarContainer from './sidebar-container'

export default function TypescriptSwitch() {
  const typescript = useProjectOptions((state) => state.typescript)
  const mode = useApplicationMode()
  const enableTypeScript = useTypeScriptEditable()

  if (mode !== 'setup') {
    return null
  }

  return (
    <SidebarContainer>
      <div className="flex justify-center">
        <div className="flex flex-row items-center justify-center">
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
      </div>
    </SidebarContainer>
  )
}
