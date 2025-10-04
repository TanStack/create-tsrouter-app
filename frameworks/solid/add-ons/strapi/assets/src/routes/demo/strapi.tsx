import { articles } from '../../lib/strapiClient'
import { createFileRoute, Link } from '@tanstack/solid-router'
import { Show, For } from 'solid-js'

export const Route = createFileRoute('/demo/strapi')({
  component: RouteComponent,
  loader: async () => {
    const { data: strapiArticles } = await articles.find()
    return strapiArticles
  },
})

function RouteComponent() {
  const strapiArticles = Route.useLoaderData()

  return (
    <div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold mb-8 text-white">
          <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Strapi
          </span>{' '}
          <span class="text-gray-300">Articles</span>
        </h1>

        <Show
          when={strapiArticles() && strapiArticles().length > 0}
          fallback={<p class="text-gray-400">No articles found.</p>}
        >
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <For each={strapiArticles()}>
              {(article) => (
                <Link
                  to="/demo/strapi/$articleId"
                  params={{ articleId: article.documentId }}
                  class="block"
                >
                  <article class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer h-full">
                    <h2 class="text-xl font-semibold text-white mb-3">
                      {article.title || 'Untitled'}
                    </h2>

                    {article.description && (
                      <p class="text-gray-400 mb-4 leading-relaxed">
                        {article.description}
                      </p>
                    )}

                    {article.content && (
                      <p class="text-gray-400 line-clamp-3 leading-relaxed">
                        {article.content}
                      </p>
                    )}

                    {article.createdAt && (
                      <p class="text-sm text-cyan-400/70 mt-4">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </article>
                </Link>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )
}
