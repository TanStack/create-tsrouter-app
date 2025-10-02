import { cloudflare } from '@cloudflare/vite-plugin'

export default cloudflare({ viteEnvironment: { name: 'ssr' } })
