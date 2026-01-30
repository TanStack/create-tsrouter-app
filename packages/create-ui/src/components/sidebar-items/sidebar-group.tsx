export default function SidebarGroup({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-black/40 shadow-xl p-4 space-y-2 rounded-lg sidebar-group">
      {children}
    </div>
  )
}
