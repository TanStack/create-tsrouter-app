## Setting up Better Auth

- Set the `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in your `.env.local`.
- if you are using pnpm or deno, make sure `better-sqlite3` post install script is run
- Run `npx @better-auth/cli migrate`
