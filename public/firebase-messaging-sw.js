// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: 'AIzaSyCUsRMF9Pu9WoWXPyCGe6HkhydTGEK-SRY',
  authDomain: 'hlc-doctor.firebaseapp.com',
  projectId: 'hlc-doctor',
  storageBucket: 'hlc-doctor.firebasestorage.app',
  messagingSenderId: '512700271342',
  appId: '1:512700271342:web:b933c58fe95b87cb9f81ff',
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload)

  const notificationTitle = payload.notification?.title || 'New Notification'
  const notificationBody = payload.notification?.body || ''
  const notificationOptions = {
    body: notificationBody,
    icon: '/logo192192.png',
    badge: '/logo32.png',
  }

  // Save notification to localStorage for later display
  try {
    const notification = {
      id: Date.now(),
      title: notificationTitle,
      body: notificationBody,
      data: payload.data || {},
      timestamp: new Date().toISOString(),
      read: false
    }
    
    // Get existing notifications
    const stored = self.localStorage?.getItem('pending_notifications') || '[]'
    const notifications = JSON.parse(stored)
    notifications.push(notification)
    
    // Keep only last 10 notifications
    if (notifications.length > 10) {
      notifications.shift()
    }
    
    self.localStorage?.setItem('pending_notifications', JSON.stringify(notifications))
    console.log('Notification saved to storage:', notification)
  } catch (error) {
    console.error('Failed to save notification:', error)
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
