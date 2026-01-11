import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ImageIcon, Loader2, Download } from 'lucide-react'

const SIZES = ['1024x1024', '1536x1024', '1024x1536', 'auto']

interface GeneratedImage {
  url?: string
  b64Json?: string
  revisedPrompt?: string
}

function ImagePage() {
  const [prompt, setPrompt] = useState(
    'A cute baby sea otter wearing a beret and glasses, sitting at a small cafe table, sipping a cappuccino',
  )
  const [size, setSize] = useState('1024x1024')
  const [numberOfImages, setNumberOfImages] = useState(1)
  const [images, setImages] = useState<Array<GeneratedImage>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)
    setImages([])

    try {
      const response = await fetch('/demo/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size, numberOfImages }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setImages(data.images)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getImageSrc = (image: GeneratedImage) => {
    if (image.url) return image.url
    if (image.b64Json) return `data:image/png;base64,${image.b64Json}`
    return ''
  }

  const handleDownload = async (image: GeneratedImage, index: number) => {
    const src = getImageSrc(image)
    if (!src) return

    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-image-${index + 1}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      // Failed to download image
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ImageIcon className="w-8 h-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-white">Image Generation</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Size
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-orange-500/20 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Count
                </label>
                <input
                  type="number"
                  value={numberOfImages}
                  onChange={(e) =>
                    setNumberOfImages(
                      Math.max(1, Math.min(4, parseInt(e.target.value) || 1)),
                    )
                  }
                  min={1}
                  max={4}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-orange-500/20 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                rows={6}
                className="w-full rounded-lg border border-orange-500/20 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                placeholder="Describe the image you want to generate..."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </button>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-orange-500/20">
            <h2 className="text-lg font-semibold text-white mb-4">
              Generated Images
            </h2>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-4">
                {error}
              </div>
            )}

            {images.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={getImageSrc(image)}
                        alt={`Generated image ${index + 1}`}
                        className="w-full rounded-lg border border-gray-700"
                      />
                      <button
                        onClick={() => handleDownload(image, index)}
                        className="absolute top-2 right-2 p-2 bg-gray-900/80 hover:bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download image"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                      {image.revisedPrompt && (
                        <p className="mt-2 text-xs text-gray-400 italic">
                          Revised: {image.revisedPrompt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : !error && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p>
                  Enter a prompt and click "Generate Image" to create an image.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/demo/ai/image')({
  component: ImagePage,
})
