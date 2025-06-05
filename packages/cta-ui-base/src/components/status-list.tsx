import type { StreamItem } from '../types'

export default function StatusList({
  streamItems,
  finished,
}: {
  streamItems: Array<StreamItem>
  finished: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      {streamItems.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <item.icon
            className={`w-4 h-4 ${index === streamItems.length - 1 && !finished ? 'text-green-500 animate-spin' : ''}`}
          />
          {item.message}
        </div>
      ))}
    </div>
  )
}
