import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "../components/Header";

import "../styles.css";

export const Route = createRootRoute({
  component: () => (
    <div className="bg-[#f5f1e4] p-3 min-h-screen">
      <Header />
      <main className="mt-20">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
});
