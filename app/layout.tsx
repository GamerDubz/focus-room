import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'Focus Room — Pomodoro Timer & Ambient Sounds',
  description: 'A distraction-free focus timer with ambient soundscapes, task tracking, and Pomodoro technique support.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className={`${inter.className} antialiased`}>{children}</body></html>
  )
}
