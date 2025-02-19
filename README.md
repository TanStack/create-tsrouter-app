# Create React App for TanStack Router

This CLI applications builds Tanstack Router applications that are the functional equivalent of [Create React App](https://create-react-app.dev/).

To help accelerate the migration away from `create-react-app` we created the `create-tsrouter-app` CLI which is a plug-n-play replacement for CRA.

Instead of:

```bash
npx create-react-app my-app
```

You can now run:

```bash
npx create-tsrouter-app@latest my-app
```

Instead of using:

```bash
npx create-react-app my-app --template typescript
```

To create a SPA application using TypeScript. You can now run:

```bash
npx create-tsrouter-app@latest my-app --template typescript
```

What you'll get is a Vite application that uses TanStack Router. All the files will still be in the same place as in CRA, but you'll get a fully functional Router setup under in `app/main.tsx`.

`create-tsrouter-app` is everything you loved about CRA but implemented with modern tools and best practices, on top of the popular TanStack set of libraries. Which includes [@tanstack/react-query](https://tanstack.com/query/latest) and [@tanstack/react-router](https://tanstack.com/router/latest).

If you want Tailwind then just add `--tailwind` and that will automatically configure [Tailwind V4](https://tailwindcss.com/).

You can also specify your preferred package manager with `--package-manager` such as `npm`, `bun`, `yarn`, or `pnpm`.

During project creation, you'll be prompted to initialize a git repository. You can use the space bar to toggle this option, and press enter to confirm your choice.

Extensive documentation on using the TanStack Router, migrating to a File Base Routing approach, as well as integrating [@tanstack/react-query](https://tanstack.com/query/latest) and [@tanstack/store](https://tanstack.com/store/latest) be found in the generated `README.md` for your project.

## File Based Routing

By default `create-tsrouter-app` will create a Code Based Routing application. If you want to use File Based Routing then you can specify `--template file-router`. The location of the home page will be `app/routes/index.tsx`.

# Contributing

Check out the [Contributing](CONTRIBUTING.md) guide.

# License

MIT
