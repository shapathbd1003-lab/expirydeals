'use client'
import { useState, useRef, useCallback } from 'react'

interface HoverState {
  lensX: number
  lensY: number
  cursorX: number
  cursorY: number
  containerW: number
  containerH: number
}

interface ImageZoomProps {
  src: string
  alt: string
  zoomFactor?: number
  lensSize?: number
}

export default function ImageZoom({ src, alt, zoomFactor = 2.5, lensSize = 180 }: ImageZoomProps) {
  const [hover, setHover] = useState<HoverState | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const half = lensSize / 2
      const cx = Math.max(half, Math.min(x, rect.width - half))
      const cy = Math.max(half, Math.min(y, rect.height - half))

      setHover({
        lensX: cx - half,
        lensY: cy - half,
        cursorX: cx,
        cursorY: cy,
        containerW: rect.width,
        containerH: rect.height,
      })
    },
    [lensSize]
  )

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-crosshair select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="object-cover w-full h-full" draggable={false} />

      {hover && (
        <div
          className="absolute rounded overflow-hidden pointer-events-none shadow-2xl"
          style={{
            width: lensSize,
            height: lensSize,
            left: hover.lensX,
            top: hover.lensY,
            border: '2px solid rgba(255,255,255,0.85)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
            zIndex: 10,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              width: hover.containerW * zoomFactor,
              height: hover.containerH * zoomFactor,
              left: -(hover.cursorX * zoomFactor - lensSize / 2),
              top: -(hover.cursorY * zoomFactor - lensSize / 2),
              maxWidth: 'none',
            }}
          />
        </div>
      )}
    </div>
  )
}
