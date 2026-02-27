import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  try {
    // Initialize with service account (for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      )
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    } 
    // Initialize with project ID only (for development)
    else if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      })
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error)
  }
}

export const sendNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
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
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
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
