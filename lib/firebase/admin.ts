import * as admin from 'firebase-admin'

let isInitialized = false

if (!admin.apps.length) {
  try {
    // Initialize with service account (for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('Initializing Firebase Admin with service account...')
      
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      )
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
      
      isInitialized = true
      console.log('Firebase Admin initialized successfully')
    } 
    // Initialize with project ID only (for development)
    else if (process.env.FIREBASE_PROJECT_ID) {
      console.log('Initializing Firebase Admin with project ID...')
      
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      })
      
      isInitialized = true
      console.log('Firebase Admin initialized successfully')
    } else {
      console.error('Firebase Admin SDK not initialized: Missing FIREBASE_SERVICE_ACCOUNT_KEY')
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
  }
} else {
  isInitialized = true
  console.log('Firebase Admin already initialized')
}

export const checkFirebaseInitialized = () => {
  return isInitialized && admin.apps.length > 0
}

export const sendNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data: { ...(data || {}), title, body },
      webpush: {
        headers: {
          Urgency: 'high',
          TTL: '86400',
        },
        notification: {
          title,
          body,
          icon: '/icons/logo192192.png',
          badge: '/logo32.png',
          requireInteraction: true,
        },
        fcmOptions: {
          link: '/',
        },
      },
      token,
    }

    const response = await admin.messaging().send(message)
    console.log('Successfully sent notification:', response)
    return response
  } catch (error) {
    console.error('Error sending notification:', error)
    throw error
  }
}

export const sendNotificationToMultiple = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      data: { ...(data || {}), title, body },
      webpush: {
        headers: {
          Urgency: 'high',
          TTL: '86400',
        },
        notification: {
          title,
          body,
          icon: '/icons/logo192192.png',
          badge: '/logo32.png',
          requireInteraction: true,
        },
        fcmOptions: {
          link: '/',
        },
      },
      tokens,
    }

    const response = await admin.messaging().sendEachForMulticast(message)
    console.log('Successfully sent notifications:', response.successCount, 'success,', response.failureCount, 'failed')
    return response
  } catch (error) {
    console.error('Error sending notifications:', error)
    throw error
  }
}

export default admin
