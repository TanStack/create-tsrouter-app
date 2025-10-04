import { articles } from '../../lib/strapiClient'
import { createFileRoute } from '@tanstack/solid-router'
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
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-6">Strapi Articles</h1>

      <Show
        when={strapiArticles() && strapiArticles().length > 0}
        fallback={<p class="text-gray-500">No articles found.</p>}
      >
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <For each={strapiArticles()}>
            {(article) => (
              <article class="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 class="text-xl font-semibold mb-2">
                  {article.title || article.attributes?.title || 'Untitled'}
                </h2>

                {(article.description || article.attributes?.description) && (
                  <p class="text-gray-600 mb-4">
                    {article.description || article.attributes?.description}
                  </p>
                )}

                {(article.content || article.attributes?.content) && (
                  <p class="text-gray-700 line-clamp-3">
                    {article.content || article.attributes?.content}
                  </p>
                )}

                {(article.createdAt || article.attributes?.createdAt) && (
                  <p class="text-sm text-gray-500 mt-4">
                    {new Date(
                      article.createdAt || article.attributes?.createdAt,
                    ).toLocaleDateString()}
                  </p>
                )}
              </article>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
