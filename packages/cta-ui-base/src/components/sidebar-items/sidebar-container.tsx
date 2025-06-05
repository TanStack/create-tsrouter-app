export default function SidebarContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="block p-4 bg-gray-500/10 hover:bg-gray-500/20 rounded-lg transition-colors space-y-4 active @container sidebar-container">
      {children}
    </div>
  )
}
