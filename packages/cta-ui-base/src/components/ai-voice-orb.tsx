import { useMemo } from 'react'

export interface AIVoiceOrbProps {
  /** Current volume level from 0 to 1 */
  volume: number
  /** Current state of the orb */
  state: 'idle' | 'listening' | 'thinking' | 'speaking'
  /** Size of the orb in pixels */
  size?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * An animated orb component that visualizes AI voice interaction.
 * The orb pulses and scales based on audio volume levels.
 */
export function AIVoiceOrb({
  volume,
  state,
  size = 200,
  className = '',
}: AIVoiceOrbProps) {
  // Calculate scale based on volume (1.0 to 1.4 range)
  const volumeScale = 1 + volume * 0.4

  // Different colors for different states
  const stateColors = useMemo(() => {
    switch (state) {
      case 'listening':
        return {
          primary: 'from-rose-400 via-pink-500 to-fuchsia-500',
          glow: 'shadow-pink-500/50',
          ring: 'border-pink-400/30',
        }
      case 'thinking':
        return {
          primary: 'from-amber-400 via-orange-500 to-yellow-500',
          glow: 'shadow-orange-500/50',
          ring: 'border-orange-400/30',
        }
      case 'speaking':
        return {
          primary: 'from-cyan-400 via-blue-500 to-indigo-500',
          glow: 'shadow-blue-500/50',
          ring: 'border-cyan-400/30',
        }
      default: // idle
        return {
          primary: 'from-slate-400 via-slate-500 to-slate-600',
          glow: 'shadow-slate-500/30',
          ring: 'border-slate-400/20',
        }
    }
  }, [state])

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow rings */}
      <div
        className={`absolute rounded-full bg-gradient-to-r ${stateColors.primary} opacity-20 blur-3xl transition-all duration-300`}
        style={{
          width: size * 1.5,
          height: size * 1.5,
          transform: `scale(${state === 'idle' ? 1 : volumeScale * 1.1})`,
        }}
      />

      {/* Middle glow ring */}
      <div
        className={`absolute rounded-full bg-gradient-to-r ${stateColors.primary} opacity-30 blur-2xl transition-all duration-200`}
        style={{
          width: size * 1.2,
          height: size * 1.2,
          transform: `scale(${state === 'idle' ? 1 : volumeScale})`,
        }}
      />

      {/* Rotating ring */}
      <div
        className={`absolute rounded-full border-2 ${stateColors.ring} transition-all duration-300`}
        style={{
          width: size * 1.15,
          height: size * 1.15,
          animation: state !== 'idle' ? 'spin 8s linear infinite' : 'none',
          opacity: state === 'idle' ? 0.3 : 0.6,
        }}
      />

      {/* Secondary rotating ring (opposite direction) */}
      <div
        className={`absolute rounded-full border ${stateColors.ring} transition-all duration-300`}
        style={{
          width: size * 1.25,
          height: size * 1.25,
          animation: state !== 'idle' ? 'spin 12s linear infinite reverse' : 'none',
          opacity: state === 'idle' ? 0.2 : 0.4,
        }}
      />

      {/* Main orb */}
      <div
        className={`relative rounded-full bg-gradient-to-br ${stateColors.primary} shadow-2xl ${stateColors.glow} transition-all duration-150`}
        style={{
          width: size * 0.8,
          height: size * 0.8,
          transform: `scale(${state === 'idle' ? 1 : volumeScale})`,
          boxShadow: state !== 'idle' 
            ? `0 0 ${40 + volume * 40}px ${20 + volume * 20}px rgba(56, 189, 248, ${0.3 + volume * 0.2})`
            : undefined,
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute top-2 left-4 w-1/4 h-1/4 rounded-full bg-white/30 blur-sm"
        />
        
        {/* Pulse animation for idle state */}
        {state === 'idle' && (
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${stateColors.primary} animate-pulse opacity-50`}
          />
        )}

        {/* Inner glow for active states */}
        {state !== 'idle' && (
          <div
            className="absolute inset-4 rounded-full bg-white/10 blur-md transition-opacity duration-200"
            style={{ opacity: 0.3 + volume * 0.4 }}
          />
        )}
      </div>

      {/* State indicator text */}
      <div
        className="absolute -bottom-8 text-center text-sm font-medium transition-all duration-300"
        style={{ opacity: state === 'idle' ? 0.5 : 0.8 }}
      >
        <span
          className={`${
            state === 'listening'
              ? 'text-pink-400'
              : state === 'thinking'
                ? 'text-orange-400'
                : state === 'speaking'
                  ? 'text-cyan-400'
                  : 'text-slate-400'
          }`}
        >
          {state === 'listening' && 'Listening...'}
          {state === 'thinking' && 'Thinking...'}
          {state === 'speaking' && 'Speaking...'}
          {state === 'idle' && 'Tap to speak'}
        </span>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

