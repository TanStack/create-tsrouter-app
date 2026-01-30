import * as React from 'react'
import { twMerge } from 'tailwind-merge'

import { useMounted } from '../hooks/use-mounted'
import { usePrefersReducedMotion } from '../hooks/use-preferred-reduced-motion'

export function BackgroundAnimation() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const mounted = useMounted()
  const isHomePage = false

  React.useEffect(() => {
    if (prefersReducedMotion !== false) {
      return
    }

    const canvas = canvasRef.current

    let morphDuration = 2000
    const waitDuration = 1000 * 60 * 2

    const easingFn = cubicBezier(0.645, 0.045, 0.355, 1.0)

    if (canvas) {
      const ctx = canvas.getContext('2d')!

      let rafId: ReturnType<typeof requestAnimationFrame> | null = null
      let timeout: ReturnType<typeof setTimeout> | null = null
      let startTime = performance.now()

      function createBlobs() {
        return shuffle([
          {
            color: { h: 10, s: 100, l: 50 },
          },
          {
            color: { h: 40, s: 100, l: 50 },
          },
          {
            color: { h: 150, s: 100, l: 50 },
          },
          {
            color: { h: 200, s: 100, l: 50 },
          },
        ]).map((blob) => ({
          ...blob,
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          r: Math.random() * 500 + 700,
          colorH: blob.color.h,
          colorS: blob.color.s,
          colorL: blob.color.l,
        }))
      }

      function shuffle<T>(array: T[]) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[array[i], array[j]] = [array[j], array[i]]
        }
        return array
      }

      let startBlobs = createBlobs()
      let currentBlobs = startBlobs
      let targetBlobs: ReturnType<typeof createBlobs> = []

      function resizeHandler() {
        // Create an offscreen canvas and copy the current content
        const offscreen = document.createElement('canvas')
        offscreen.width = canvas!.width
        offscreen.height = canvas!.height
        offscreen.getContext('2d')!.drawImage(canvas!, 0, 0)

        // Resize the main canvas
        canvas!.width = window.innerWidth
        canvas!.height = window.innerHeight

        // Stretch and redraw the saved content to fill the new size
        ctx.drawImage(offscreen, 0, 0, canvas!.width, canvas!.height)
      }

      function start() {
        if (timeout) {
          clearTimeout(timeout)
        }
        if (rafId) {
          cancelAnimationFrame(rafId)
        }

        startBlobs = JSON.parse(JSON.stringify(currentBlobs))
        targetBlobs = createBlobs()
        startTime = performance.now()
        animate()
      }

      function animate() {
        ctx.clearRect(0, 0, canvas!.width, canvas!.height)

        const time = performance.now() - startTime
        const progress = time / morphDuration
        const easedProgress = easingFn(progress)

        // Draw the blobs
        startBlobs.forEach((startBlob, i) => {
          const targetBlob = targetBlobs[i]

          currentBlobs[i].x = interpolate(
            startBlob.x,
            targetBlob.x,
            easedProgress,
          )
          currentBlobs[i].y = interpolate(
            startBlob.y,
            targetBlob.y,
            easedProgress,
          )

          const gradient = ctx.createRadialGradient(
            currentBlobs[i].x,
            currentBlobs[i].y,
            0,
            currentBlobs[i].x,
            currentBlobs[i].y,
            currentBlobs[i].r,
          )

          currentBlobs[i].colorH = interpolate(
            startBlob.colorH,
            targetBlob.colorH,
            easedProgress,
          )
          currentBlobs[i].colorS = interpolate(
            startBlob.colorS,
            targetBlob.colorS,
            easedProgress,
          )
          currentBlobs[i].colorL = interpolate(
            startBlob.colorL,
            targetBlob.colorL,
            easedProgress,
          )

          gradient.addColorStop(
            0,
            `hsla(${currentBlobs[i].colorH}, ${currentBlobs[i].colorS}%, ${currentBlobs[i].colorL}%, 1)`,
          )
          gradient.addColorStop(
            1,
            `hsla(${currentBlobs[i].colorH}, ${currentBlobs[i].colorS}%, ${currentBlobs[i].colorL}%, 0)`,
          )

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(
            currentBlobs[i].x,
            currentBlobs[i].y,
            currentBlobs[i].r,
            0,
            Math.PI * 2,
          )
          ctx.fill()
        })

        if (progress < 1) {
          rafId = requestAnimationFrame(animate)
        } else {
          timeout = setTimeout(() => {
            morphDuration = 4000
            start()
          }, waitDuration)
        }
      }

      resizeHandler()
      start()
      window.addEventListener('resize', resizeHandler)

      return () => {
        if (rafId) {
          cancelAnimationFrame(rafId)
        }
        if (timeout) {
          clearTimeout(timeout)
        }
        window.removeEventListener('resize', resizeHandler)
      }
    }
  }, [prefersReducedMotion])

  return (
    <div
      className={twMerge(
        'fixed inset-0 z-0 opacity-20 pointer-events-none',
        'transition-opacity duration-[2s] ease-linear',
        '[&+*]:relative',
        mounted
          ? isHomePage
            ? 'opacity-10 dark:opacity-20'
            : 'opacity-10 dark:opacity-20'
          : 'opacity-0',
      )}
    >
      <canvas ref={canvasRef} />
    </div>
  )
}

function cubicBezier(_p1x: number, p1y: number, _p2x: number, p2y: number) {
  return function (t: number) {
    const cy = 3 * p1y
    const by = 3 * (p2y - p1y) - cy
    const ay = 1 - cy - by

    const y = ((ay * t + by) * t + cy) * t

    return y
  }
}

function interpolate(start: number, end: number, progress: number) {
  return start + (end - start) * progress
}
