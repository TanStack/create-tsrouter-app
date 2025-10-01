import { serve } from 'srvx';
import { serveStatic } from 'srvx/static';
import server from './dist/server/server.js';

serve({
  fetch: server.fetch,
  middleware: [
    serveStatic({
      dir: 'dist/client',
    }),
  ],
});