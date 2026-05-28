importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyCUsRMF9Pu9WoWXPyCGe6HkhydTGEK-SRY',
  authDomain: 'hlc-doctor.firebaseapp.com',
  projectId: 'hlc-doctor',
  storageBucket: 'hlc-doctor.firebasestorage.app',
  messagingSenderId: '512700271342',
  appId: '1:512700271342:web:b933c58fe95b87cb9f81ff',
})

const messaging = firebase.messaging()

// Android/Desktop: Firebase SDK background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] onBackgroundMessage:', payload)

  // iOS에서는 이 핸들러가 호출되지 않을 수 있으므로
  // 아래 push 이벤트 리스너가 fallback 역할을 합니다.
  const title = payload.notification?.title || payload.data?.title || '새 알림'
  const body = payload.notification?.body || payload.data?.body || ''

  self.registration.showNotification(title, {
    body,
    icon: '/icons/logo192192.png',
    badge: '/logo32.png',
    data: payload.data || {},
    tag: 'fcm-' + Date.now(),
  })
})

// iOS Safari PWA: 네이티브 push 이벤트 리스너 (fallback)
// iOS는 Firebase SDK의 onBackgroundMessage 대신 이 핸들러를 사용합니다.
self.addEventListener('push', (event) => {
  console.log('[SW] push event received:', event)

  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch (e) {
    payload = { notification: { title: '새 알림', body: event.data.text() } }
  }

  // Firebase SDK가 이미 처리한 경우 중복 방지
  // FCM은 notification 필드가 있으면 자동으로 알림을 표시하므로
  // data-only 메시지일 때만 수동으로 표시
  const isDataOnly = !payload.notification && payload.data
  const fcmData = payload.data || {}
  const notification = payload.notification || {}

  const title = notification.title || fcmData.title || '새 알림'
  const body = notification.body || fcmData.body || ''

  // iOS에서는 notification 필드가 있어도 자동 표시가 안 될 수 있으므로
  // waitUntil로 알림 표시를 보장합니다.
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/logo192192.png',
      badge: '/logo32.png',
      data: fcmData,
      tag: 'push-' + Date.now(),
    })
  )
})

// 알림 클릭 시 앱 열기
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] notificationclick:', event)
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow(targetUrl)
    })
  )
})

// 서비스 워커 즉시 활성화
self.addEventListener('install', (event) => {
  console.log('[SW] install')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] activate')
  event.waitUntil(self.clients.claim())
})
