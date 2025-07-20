import { authClient } from "@/lib/auth-client";

export default function HeaderUser() {
	return (
		<div className="flex items-center justify-center gap-2">
			<Avatar />
			<LogoutButton />
		</div>
	);
}

function Avatar() {
	const { data } = authClient.useSession();
	const user = data?.user;
	if (!user) return null;
	return (
		<div className="relative inline-flex items-center justify-center w-6 h-6 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
			<span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
				{user.name.slice(0, 2)}
			</span>
		</div>
	);
}

function LogoutButton() {
	const { data } = authClient.useSession();
	const session = data?.session;
	if (!session) return null;
	return (
		<button
			onClick={() => authClient.signOut()}
			type="button"
			className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-2 py-1 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
		>
			Logout
		</button>
	);
}
