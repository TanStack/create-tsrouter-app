import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
})
