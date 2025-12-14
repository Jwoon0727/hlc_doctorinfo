"use client"

import { useEffect, useState } from "react"
import { X, Download } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getCookie, setCookie } from "@/lib/cookies"

const COOKIE_NAME = "install_prompt_seen"

export function InstallPrompt() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // 쿠키 확인
    const hasSeenPrompt = getCookie(COOKIE_NAME)

    // 쿠키가 없으면 (처음 방문) 모달 표시
    if (!hasSeenPrompt) {
      // 약간의 딜레이 후 표시 (사용자 경험 개선)
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleYes = () => {
    setCookie(COOKIE_NAME, "yes", 365)
    setIsOpen(false)
  }

  const handleNo = () => {
    setCookie(COOKIE_NAME, "no", 365)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" style={{ backgroundColor: '#FFFFFF' }}>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <Image
              src="/icons/logo192192.png"
              alt="앱 아이콘"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">홈 화면에 추가하세요</DialogTitle>
          <DialogDescription className="text-center text-base">
            더 빠르고 편리하게 의사 검색 서비스를 이용하세요
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex justify-center">
          <Image
            src="/icons/home.jpg"
            alt="홈 화면 추가 안내"
            width={300}
            height={150}
            className="rounded-lg object-contain"
          />
        </div>

        <div className="mt-4 space-y-3">
          <Button
            onClick={handleYes}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
          >
            <Download className="mr-2 h-5 w-5" />
            나중에 할게요
          </Button>

        </div>

        <p className="text-center text-xs text-muted-foreground mt-2">이 메시지는 다시 표시되지 않습니다</p>
      </DialogContent>
    </Dialog>
  )
}
