import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Script from "next/script"

const _inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "GidroAtlas — Мониторинг водных ресурсов",
  description: "Интерактивная карта водных ресурсов с мониторингом технического состояния",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="beforeInteractive" />
      </body>
    </html>
  )
}
