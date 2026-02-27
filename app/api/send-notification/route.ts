import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendNotificationToMultiple, checkFirebaseInitialized } from '@/lib/firebase/admin'

// Check if Supabase credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function POST(request: NextRequest) {
  try {
    console.log('=== send-notification API called ===')
    console.log('Environment check:')
    console.log('- SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing')
    console.log('- FIREBASE_SERVICE_ACCOUNT_KEY:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'Set' : 'Missing')
    
    const { title, body, data } = await request.json()

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    if (!supabase) {
      console.error('Supabase not configured')
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      )
    }
    
    // Check Firebase initialization
    if (!checkFirebaseInitialized()) {
      console.error('Firebase Admin SDK not initialized')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Firebase not configured',
          message: 'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing or invalid' 
        },
        { status: 500 }
      )
    }

    // Get all FCM tokens from database
    const { data: tokens, error } = await supabase
      .from('fcm_tokens')
      .select('token')
      .eq('active', true)

    if (error) {
      console.error('Error fetching tokens:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tokens' },
        { status: 500 }
      )
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json(
        { message: 'No active tokens found' },
        { status: 200 }
      )
    }

    console.log(`Sending notification to ${tokens.length} devices:`, { title, body })

    // Send notifications using Firebase Admin SDK (HTTP v1 API)
    const tokenStrings = tokens.map(t => t.token)
    
    try {
      const result = await sendNotificationToMultiple(
        tokenStrings,
        title,
        body,
        data || {}
      )

      console.log(`Notification sent: ${result.successCount} success, ${result.failureCount} failed`)

      return NextResponse.json({
        success: true,
        message: `Notification sent to ${result.successCount} devices`,
        successCount: result.successCount,
        failureCount: result.failureCount,
        totalCount: tokens.length,
      })
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError)
      return NextResponse.json({
        success: false,
        error: 'Failed to send notifications. Check Firebase Admin SDK configuration.',
        message: String(notificationError),
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in send-notification API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
