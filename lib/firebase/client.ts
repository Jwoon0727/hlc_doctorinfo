import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

let messaging: Messaging | null = null

if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app)
  } catch (error) {
    console.error('Firebase messaging initialization error:', error)
  }
}

export { app, messaging }

export const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false
  return (
    ('standalone' in window.navigator && (window.navigator as any).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

export const requestNotificationPermission = async (
  swRegistration?: ServiceWorkerRegistration
): Promise<string | null> => {
  try {
    if (typeof window === 'undefined' || !messaging) {
      return null
    }

    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return null
    }

    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      const tokenOptions: { vapidKey?: string; serviceWorkerRegistration?: ServiceWorkerRegistration } = {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      }

      // iOS Safari에서는 서비스 워커 등록 객체를 명시적으로 전달해야 합니다.
      if (swRegistration) {
        tokenOptions.serviceWorkerRegistration = swRegistration
      }

      const token = await getToken(messaging, tokenOptions)
      console.log('FCM Token:', token)
      return token
    } else {
      console.log('Notification permission denied')
      return null
    }
  } catch (error) {
    console.error('Error getting notification permission:', error)
    return null
  }
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return

    onMessage(messaging, (payload) => {
      console.log('Message received:', payload)
      resolve(payload)
    })
  })
