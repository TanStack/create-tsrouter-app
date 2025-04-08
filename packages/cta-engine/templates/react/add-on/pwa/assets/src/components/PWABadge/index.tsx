import { useRegisterSW } from 'virtual:pwa-register/react'

import styles from './PWABadge.module.css'

function PWABadge() {
  // check for updates every hour
  const period = 60 * 60 * 1000

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r)
      }
      else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          const sw = e.target as ServiceWorker
          if (sw.state === 'activated')
            registerPeriodicSync(period, swUrl, r)
        })
      }
    },
  })

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className={styles.Container} role="alert" aria-labelledby="toast-message">
      { (needRefresh || offlineReady) ?
      (
        <div className={styles.Toast}>
          <div className={styles.Message}>
            {offlineReady ? (
              <span id="toast-message">App ready to work offline</span>
            ) : (
              <span id="toast-message">New content available, click on reload button to update.</span>
            )}
          </div>
          <div>
            {needRefresh ? (
              <button className={styles.ToastButton} onClick={() => updateServiceWorker(true)}>Reload</button>
            ) : null}
            <button className={styles.ToastButton} onClick={() => close()}>Close</button>
          </div>
        </div>
      ): null}
    </div>
  )
}

export default PWABadge

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(period: number, swUrl: string, r: ServiceWorkerRegistration) {
  if (period <= 0) return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine)
      return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200)
      await r.update()
  }, period)
}
