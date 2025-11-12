import type { Metadata } from 'next'
import { WhopProvider } from '@/components/WhopProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'LevelUp - Smart Gamification Suite',
  description: 'Add sophisticated gamification mechanics to your Whop community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WhopProvider>
          {children}
        </WhopProvider>
      </body>
    </html>
  )
}
