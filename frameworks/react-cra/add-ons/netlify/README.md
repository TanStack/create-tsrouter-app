## Setting up Netlify

Install the [`@netlify/vite-plugin-tanstack-start`](https://www.npmjs.com/package/@netlify/vite-plugin-tanstack-start) plugin:

```bash
npm install -D @netlify/vite-plugin-tanstack-start
```

Add the plugin to your `vite.config.ts`:

```ts
import netlify from '@netlify/vite-plugin-tanstack-start'

export default defineConfig({
  plugins: [
    // ... your existing plugins
    netlify(),
  ],
})
```

A `netlify.toml` file has been automatically created for you with the correct build settings.

That's it. You can now deploy your app [from Netlify UI](https://docs.netlify.com/start/add-new-project/#import-from-an-existing-repository) or with the [Netlify CLI](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/#manual-deploys).
