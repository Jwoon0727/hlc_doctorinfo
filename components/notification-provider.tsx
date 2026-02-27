"use client"

import { useEffect } from 'react'
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase/client'
import { useToast } from '@/hooks/use-toast'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }

    // Request notification permission and register token
    const initNotifications = async () => {
      const token = await requestNotificationPermission()
      
      if (token) {
        // Register token with backend
        try {
          await fetch('/api/register-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          })
          console.log('Token registered successfully')
        } catch (error) {
          console.error('Failed to register token:', error)
        }
      }
    }

    initNotifications()

    // Listen for foreground messages
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
