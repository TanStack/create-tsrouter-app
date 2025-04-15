import { authClient } from "@/lib/auth-client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/demo/better-auth/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data, isPending } = authClient.useSession();
	const session = data?.session;
	const [error, setError] = useState<string | null>(null);
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		const formData = new FormData(e.currentTarget);
		e.preventDefault();
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		authClient.signIn.email(
			{
				email,
				password,
			},
			{
				onError(context) {
					setError(context.error.message);
				},
				onSuccess() {
					e.currentTarget.reset();
				},
			},
		);
	};
	return (
		<>
			<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-4">
				Sign in to your account
			</h1>
			<form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
				<div>
					<label
						htmlFor="email"
						className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>
						Your email
					</label>
					<input
						type="email"
						name="email"
						id="email"
						className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="name@company.com"
						required
					/>
				</div>
				<div>
					<label
						htmlFor="password"
						className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>
						Password
					</label>
					<input
						type="password"
						name="password"
						id="password"
						placeholder="••••••••"
						className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						required
					/>
				</div>
				<button
					type="submit"
					disabled={isPending || !!session}
					className="w-full text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
				>
					Sign in
				</button>
				{session && <p className="text-green-500 m-0">You are signed in</p>}
				{error && <p className="text-red-500 m-0">{error}</p>}
				<p className="text-sm font-light text-gray-500 dark:text-gray-400">
					Don't have an account yet?{" "}
					<Link
						to="/demo/better-auth/signup"
						className="font-medium text-primary-600 hover:underline dark:text-primary-500"
					>
						Sign up
					</Link>
				</p>
			</form>
		</>
	);
}
