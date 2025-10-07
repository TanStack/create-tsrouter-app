const ALS_RESOLVER = `resolve: {
  alias: {
    'node:async_hooks': '\\0virtual:async_hooks',
    async_hooks: '\\0virtual:async_hooks',
  },
},`

const ALS_SHIM = `export class AsyncLocalStorage {
  constructor() {
    // queue: array of { store, fn, resolve, reject }
    this._queue = [];
    this._running = false;        // true while processing queue
    this._currentStore = undefined; // store visible to getStore() while a run executes
  }

  /**
   * run(store, callback, ...args) -> Promise
   * Queues the callback to run with store as the current store. If the callback
   * returns a Promise, the queue waits for it to settle before starting the next run.
   */
  run(store, callback, ...args) {
    return new Promise((resolve, reject) => {
      this._queue.push({
        store,
        fn: () => callback(...args),
        resolve,
        reject,
      });
      // start processing (if not already)
      this._processQueue().catch((err) => {
        // _processQueue shouldn't throw; but guard anyway.
        console.error('SerialAsyncLocalStorage internal error:', err);
      });
    });
  }

  /**
   * getStore() -> current store or undefined
   * Returns the store of the currently executing run (or undefined if none).
   */
  getStore() {
    return this._currentStore;
  }

  /**
   * enterWith(store)
   * Set the current store for the currently running task synchronously.
   * Throws if there is no active run (this polyfill requires you to be inside a run).
   */
  enterWith(store) {
    if (!this._running) {
      throw new Error('enterWith() may be used only while a run is active.');
    }
    this._currentStore = store;
  }

  // internal: process queue serially
  async _processQueue() {
    if (this._running) return;
    this._running = true;

    while (this._queue.length) {
      const { store, fn, resolve, reject } = this._queue.shift();
      const prevStore = this._currentStore;
      this._currentStore = store;

      try {
        const result = fn();
        // await if callback returned a promise
        const awaited = result instanceof Promise ? await result : result;
        resolve(awaited);
      } catch (err) {
        reject(err);
      } finally {
        // restore previous store (if any)
        this._currentStore = prevStore;
      }
      // loop continues to next queued task
    }

    this._running = false;
  }
}
export default AsyncLocalStorage
`

const ALS_SHIM_LOADER = `
function alsShim(): PluginOption {
  return {
    enforce: 'pre',
    name: 'virtual-async-hooks',
    config() {
      return {
        resolve: {
          alias: {
            // catch both forms
            'node:async_hooks': '\\0virtual:async_hooks',
            async_hooks: '\\0virtual:async_hooks',
          },
        },
      };
    },
    resolveId(id) {
      if (id === '\\0virtual:async_hooks') return id;
    },
    load(id) {
      if (id !== '\\0virtual:async_hooks') return null;

      console.log('loaded!', id);

      return \`${ALS_SHIM}\`;
    },
  };
}
`

export default function shimALS(fileName: string, content: string) {
  let adjustedContent = content
  if (fileName === 'vite.config.ts') {
    adjustedContent += ALS_SHIM_LOADER
    adjustedContent = adjustedContent.replace(
      'plugins: [',
      `${ALS_RESOLVER}plugins: [alsShim(),`,
    )
  }
  return adjustedContent
}
