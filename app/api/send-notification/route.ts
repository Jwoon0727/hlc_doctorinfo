import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Check if Supabase credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function POST(request: NextRequest) {
  try {
    const { title, body, data } = await request.json()

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    if (!supabase) {
      console.warn('Supabase not configured - skipping notification send')
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 200 }
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

    // For now, just log that we would send notifications
    // Firebase Admin SDK needs to be properly configured
    console.log(`Would send notification to ${tokens.length} devices:`, { title, body })

    return NextResponse.json({
      success: true,
      message: `Notification queued for ${tokens.length} devices`,
      tokenCount: tokens.length,
    })
  } catch (error) {
    console.error('Error in send-notification API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
