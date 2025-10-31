## Setting up Strapi

The current setup shows an example of how to use Strapi with an articles collection which is part of the example structure & data.

- Create a local running copy of the strapi admin

```bash
pnpm dlx create-strapi@latest my-strapi-project
cd my-strapi-project
pnpm dev
```

- Login and publish the example articles to see them on the strapi demo page.
- Set the `VITE_STRAPI_URL` environment variable in your `.env.local`. (For local it should be http://localhost:1337/api)
