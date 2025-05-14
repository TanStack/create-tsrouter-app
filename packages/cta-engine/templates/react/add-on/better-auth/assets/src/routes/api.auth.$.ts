import { auth } from '@/lib/auth'
import { createAPIFileRoute } from '@tanstack/react-start/api'
 
export const APIRoute = createAPIFileRoute('/api/auth/$')({
    GET: ({ request }) => {
        return auth.handler(request)
    },
    POST: ({ request }) => {
        return auth.handler(request)
    },
});