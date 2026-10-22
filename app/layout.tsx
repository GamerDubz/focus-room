import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const quicksand = localFont({
  src: './fonts/quicksand.ttf',
  weight: '300 700',
  variable: '--font-quicksand',
  display: 'swap',
})

const nunito = localFont({
  src: './fonts/nunito.ttf',
  weight: '200 1000',
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Focus Room — a quiet place to work',
  description:
    'A calm, distraction-free focus timer with ambient soundscapes and session tasks, built around the Pomodoro technique.',
}

export const viewport: Viewport = {
  themeColor: '#f3efe6',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${quicksand.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  )
}
