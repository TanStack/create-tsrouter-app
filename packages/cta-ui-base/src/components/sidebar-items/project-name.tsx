import { Input } from '../ui/input'

import {
  setProjectName,
  useApplicationMode,
  useProjectName,
} from '../../store/project'

import SidebarContainer from './sidebar-container'

export default function ProjectName({ aiButtons }: { aiButtons?: React.ReactNode }) {
  const name = useProjectName()
  const mode = useApplicationMode()

  if (mode !== 'setup') {
    return null
  }

  return (
    <SidebarContainer>
      <div className="flex flex-row gap-2 items-center">
        <h3 className="font-medium whitespace-nowrap">Project Name</h3>
        <Input
          value={name}
          placeholder="my-app"
          onChange={(e) => setProjectName(e.target.value)}
          className="flex-1 bg-gray-500/10 rounded-md px-2 py-1 min-w-[120px] text-sm"
        />
        {aiButtons}
      </div>
    </SidebarContainer>
  )
}
