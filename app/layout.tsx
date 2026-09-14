import type { Metadata, Viewport } from 'next'
import { Quicksand, Nunito } from 'next/font/google'
import './globals.css'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
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
