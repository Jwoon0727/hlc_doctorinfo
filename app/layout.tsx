import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "협조의사명단",
  description: "천안 hlc&pvg 외에 다른 유저의 접근을 제한합니다.",
  generator: "v0.app",
  manifest: "/manifest.json", 
  themeColor: "#f8fafc",
  icons: {
    icon: [
      {
        url: "public/logo32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/logo32.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
