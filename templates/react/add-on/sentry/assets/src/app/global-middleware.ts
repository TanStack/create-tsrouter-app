import { createIsomorphicFn } from '@tanstack/start'
import * as Sentry from "@sentry/react";
import * as SentryServer from "@sentry/node";

createIsomorphicFn().server(() => {
    console.log('Sentry init server')
    SentryServer.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
    })
}).client(() => {
    console.log('Sentry init client')
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
        integrations: [
            Sentry.replayIntegration({
                maskAllText: false,
                blockAllMedia: false,
              })
        ]
    })
})()