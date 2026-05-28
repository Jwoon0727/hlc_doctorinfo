"use client"

import { useEffect } from 'react'
import { requestNotificationPermission, onMessageListener, isIOS, isStandalone } from '@/lib/firebase/client'
import { useToast } from '@/hooks/use-toast'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()

  useEffect(() => {
    const initNotifications = async () => {
      if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported')
        return
      }

      // iOS에서는 홈 화면에 추가된 PWA(standalone)에서만 푸시 알림 지원
      if (isIOS() && !isStandalone()) {
        console.log('iOS: Push notifications require the app to be added to home screen')
        return
      }

      try {
        // 서비스 워커 등록 (이미 등록되어 있으면 기존 등록 반환)
        const registration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          { scope: '/' }
        )
        console.log('Service Worker registered:', registration)

        // 서비스 워커가 활성화될 때까지 대기
        await navigator.serviceWorker.ready

        // iOS에서는 SW registration을 명시적으로 전달
        const token = await requestNotificationPermission(registration)

        if (token) {
          try {
            await fetch('/api/register-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            })
            console.log('Token registered successfully')
          } catch (error) {
            console.error('Failed to register token:', error)
          }
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }

    initNotifications()

    onMessageListener()
      .then((payload: any) => {
        console.log('Foreground message received:', payload)
        toast({
          title: payload.notification?.title || 'New Notification',
          description: payload.notification?.body || '',
        })
      })
      .catch((error) => {
        console.error('Error listening to messages:', error)
      })
  }, [toast])

  return <>{children}</>
}
