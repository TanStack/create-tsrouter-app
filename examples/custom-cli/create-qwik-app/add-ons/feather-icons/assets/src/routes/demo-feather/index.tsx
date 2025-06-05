import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import { ThumbsUpIcon } from 'qwik-feather-icons'

export default component$(() => {
  return (
    <>
      <h1 class="text-3xl font-bold underline p-5">Hi 👋</h1>
      <div>
        <ThumbsUpIcon />
      </div>
    </>
  )
})

export const head: DocumentHead = {
  title: 'Feather Icons',
  meta: [
    {
      name: 'description',
      content: 'Feather Icons',
    },
  ],
}
