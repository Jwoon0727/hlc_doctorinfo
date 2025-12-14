-- Add email, phone, and notes fields to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

