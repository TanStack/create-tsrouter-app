import { Link } from "@tanstack/react-router";

import TanchatHeader from "@/integrations/tanchat/header-user";

export default function Header() {
  return (
    <header className="p-4 flex gap-2 bg-black/30 text-white border-b border-orange-500/20 backdrop-blur-md sticky top-0 z-50">
      <nav className="flex flex-row items-center">
        <div className="px-4 font-extrabold text-lg">
          <Link
            to="/"
            className="hover:text-orange-400 transition-colors flex flex-row items-center"
          >
            <img
              src="/logo.png"
              alt="Luna-C Motorcycles"
              className="w-20 h-20"
            />
            <span className="text-2xl font-bold">Luna-C Motorcycles</span>
          </Link>
        </div>
      </nav>

      <div className="ml-auto">
        <TanchatHeader />
      </div>
    </header>
  );
}
