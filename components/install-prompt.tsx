"use client"

import { useEffect, useState } from "react"
import { X, Smartphone, Download, CheckCircle } from "lucide-react"
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">홈 화면에 추가하세요</DialogTitle>
          <DialogDescription className="text-center text-base">
            더 빠르고 편리하게 의사 검색 서비스를 이용하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">빠른 접근</p>
              <p className="text-sm text-blue-700">앱처럼 홈 화면에서 바로 실행</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-indigo-50 p-3">
            <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-indigo-900">오프라인 사용</p>
              <p className="text-sm text-indigo-700">인터넷 없이도 저장된 데이터 확인</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-purple-50 p-3">
            <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-purple-900">알림 받기</p>
              <p className="text-sm text-purple-700">새로운 의사 정보 업데이트 알림</p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Button
            onClick={handleYes}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
          >
            <Download className="mr-2 h-5 w-5" />
            네, 추가할게요
          </Button>

          <Button onClick={handleNo} variant="outline" className="w-full h-12 border-2 hover:bg-gray-50 bg-transparent">
            <X className="mr-2 h-4 w-4" />
            나중에 할게요
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-2">이 메시지는 다시 표시되지 않습니다</p>
      </DialogContent>
    </Dialog>
  )
}
