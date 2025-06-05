import { QwikLogo } from './qwik-logo'

export function Header() {
  return (
    <div className="bg-white dark:bg-black/50 rounded-lg p-2 sm:p-4 flex items-center gap-2 text-lg sm:text-xl shadow-xl">
      <div className="flex items-center gap-1.5">
        <QwikLogo className="w-10 h-10" />
        <div className="font-black text-xl uppercase">Qwik</div>
      </div>
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 256 512"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"></path>
      </svg>
      <div className="hover:text-blue-500 flex items-center gap-2">
        Create Qwik App
      </div>
    </div>
  )
}
