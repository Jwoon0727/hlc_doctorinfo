import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { NotificationProvider } from "@/components/notification-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "협조의사명단",
  description: "천안 hlc&pvg 외에 다른 유저의 접근을 제한합니다.",
  generator: "v0.app",
  manifest: "/manifest.json", 
  themeColor: "#3b82f6",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "협조의사명단",
  },
  icons: {
    icon: [
      {
        url: "/logo32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons/logo192192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/logo512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/logo192192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
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
        <NotificationProvider>
          {children}
          <Toaster />
        </NotificationProvider>
        <Analytics />
      </body>
    </html>
  )
}
