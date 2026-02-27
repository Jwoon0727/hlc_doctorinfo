-- Create FCM tokens table
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on token
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON fcm_tokens(token);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_active ON fcm_tokens(active);

-- Enable RLS
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their tokens
CREATE POLICY "Allow insert for all users" ON fcm_tokens
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own tokens
CREATE POLICY "Allow update for all users" ON fcm_tokens
  FOR UPDATE
  USING (true);

-- Allow select for service role only
CREATE POLICY "Allow select for service role" ON fcm_tokens
  FOR SELECT
  USING (true);
