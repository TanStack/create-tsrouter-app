import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/demo/better-auth")({
  component: BetterAuthDemo,
});

function BetterAuthDemo() {
  const session = authClient.useSession();
  const [isSignUp, setIsSignUp] = createSignal(false);
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [name, setName] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp()) {
        const result = await authClient.signUp.email({
          email: email(),
          password: password(),
          name: name(),
        });
        if (result.error) {
          setError(result.error.message || "Sign up failed");
        }
      } else {
        const result = await authClient.signIn.email({
          email: email(),
          password: password(),
        });
        if (result.error) {
          setError(result.error.message || "Sign in failed");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Show
      when={!session().isPending}
      fallback={
        <div class="flex items-center justify-center py-10">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-800 dark:border-t-neutral-100" />
        </div>
      }
    >
      <Show
        when={session().data?.user}
        fallback={
          <div class="flex justify-center py-10 px-4">
            <div class="w-full max-w-md p-6">
              <h1 class="text-lg font-semibold leading-none tracking-tight">
                {isSignUp() ? "Create an account" : "Sign in"}
              </h1>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
                {isSignUp()
                  ? "Enter your information to create an account"
                  : "Enter your email below to login to your account"}
              </p>

              <form onSubmit={handleSubmit} class="grid gap-4">
                <Show when={isSignUp()}>
                  <div class="grid gap-2">
                    <label for="name" class="text-sm font-medium leading-none">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name()}
                      onInput={(e) => setName(e.currentTarget.value)}
                      class="flex h-9 w-full border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>
                </Show>

                <div class="grid gap-2">
                  <label for="email" class="text-sm font-medium leading-none">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email()}
                    onInput={(e) => setEmail(e.currentTarget.value)}
                    class="flex h-9 w-full border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>

                <div class="grid gap-2">
                  <label
                    for="password"
                    class="text-sm font-medium leading-none"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password()}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                    class="flex h-9 w-full border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    minLength={8}
                  />
                </div>

                <Show when={error()}>
                  <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                    <p class="text-sm text-red-600 dark:text-red-400">
                      {error()}
                    </p>
                  </div>
                </Show>

                <button
                  type="submit"
                  disabled={loading()}
                  class="w-full h-9 px-4 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Show
                    when={!loading()}
                    fallback={
                      <span class="flex items-center justify-center gap-2">
                        <span class="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-white dark:border-neutral-600 dark:border-t-neutral-900" />
                        <span>Please wait</span>
                      </span>
                    }
                  >
                    {isSignUp() ? "Create account" : "Sign in"}
                  </Show>
                </button>
              </form>

              <div class="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp());
                    setError("");
                  }}
                  class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  {isSignUp()
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>

              <p class="mt-6 text-xs text-center text-neutral-400 dark:text-neutral-500">
                Built with{" "}
                <a
                  href="https://better-auth.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-medium hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  BETTER-AUTH
                </a>
                .
              </p>
            </div>
          </div>
        }
      >
        {(user) => (
          <div class="flex justify-center py-10 px-4">
            <div class="w-full max-w-md p-6 space-y-6">
              <div class="space-y-1.5">
                <h1 class="text-lg font-semibold leading-none tracking-tight">
                  Welcome back
                </h1>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">
                  You're signed in as {user().email}
                </p>
              </div>

              <div class="flex items-center gap-3">
                <Show
                  when={user().image}
                  fallback={
                    <div class="h-10 w-10 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                      <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        {user().name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  }
                >
                  {(image) => <img src={image()} alt="" class="h-10 w-10" />}
                </Show>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{user().name}</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {user().email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  void authClient.signOut();
                }}
                class="w-full h-9 px-4 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Sign out
              </button>

              <p class="text-xs text-center text-neutral-400 dark:text-neutral-500">
                Built with{" "}
                <a
                  href="https://better-auth.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-medium hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  BETTER-AUTH
                </a>
                .
              </p>
            </div>
          </div>
        )}
      </Show>
    </Show>
  );
}
