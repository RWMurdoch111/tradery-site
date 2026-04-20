import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tradery — Bespoke websites for London tradespeople',
  description: 'I build bespoke websites for London tradespeople. One price, full handover. You see the site before you pay a penny.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
