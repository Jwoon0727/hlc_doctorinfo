"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { UserPlus, Home, AlertTriangle, User, Lock, Loader2, CheckCircle2 } from "lucide-react"
import { registerAdmin, checkAdminExists } from "@/lib/supabase/admins"

export default function AdminRegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    // Validation
    if (name.length < 3) {
      setError("이름은 최소 3자 이상이어야 합니다.")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      setIsLoading(false)
      return
    }

    try {
      // Check if admin already exists
      const exists = await checkAdminExists(name)
      if (exists) {
        setError("이미 존재하는 관리자 이름입니다.")
        setIsLoading(false)
        return
      }

      // Register admin
      await registerAdmin(name, password)
      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/admin/login")
      }, 2000)
    } catch (err) {
      console.error("Failed to register admin:", err)
      setError("관리자 등록에 실패했습니다. 다시 시도해주세요.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-4 pb-0">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              홈화면
            </Button>
          </Link>
        </div>
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            관리자 등록
          </CardTitle>
          <CardDescription className="text-base">새로운 관리자 계정을 생성하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 font-medium">
                관리자 계정은 의사 명단을 관리할 수 있는 권한을 부여합니다.
              </p>
            </div>
            
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                관리자 이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="최소 3자 이상"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                className="h-12"
                autoComplete="username"
              />
              <p className="text-xs text-muted-foreground">영문, 숫자 조합 가능</p>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                비밀번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="최소 8자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-12"
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">안전한 비밀번호를 사용하세요</p>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                비밀번호 확인 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="h-12"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-600 font-medium">
                  관리자 등록이 완료되었습니다! 로그인 페이지로 이동합니다...
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading || success} 
              className="w-full h-12 text-base font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : success ? (
                "등록 완료"
              ) : (
                "관리자 등록"
              )}
            </Button>

            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground">
                이미 계정이 있으신가요?{" "}
                <Link href="/admin/login" className="text-indigo-600 hover:underline font-medium">
                  로그인하기
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

