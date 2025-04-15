import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/better-auth")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center mx-auto min-h-[calc(100vh-32px)]">
			<div className="p-6 w-full bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700 max-w-md mx-4">
				<Outlet />
			</div>
		</section>
	);
}


