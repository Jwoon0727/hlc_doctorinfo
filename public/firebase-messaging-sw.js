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
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo192192.png',
    badge: '/logo32.png',
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
