import { ImageResponse } from 'next/og'

// Static export needs icon routes marked static explicitly.
export const dynamic = 'force-static'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F3EFE6',
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: '50%',
            border: '3px solid rgba(58,52,44,0.32)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              border: '3px solid rgba(58,52,44,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#B5583A',
                display: 'flex',
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
