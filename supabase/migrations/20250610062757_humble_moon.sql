/*
  # Chat Files Storage Setup

  1. Storage Setup
    - Create chat-files bucket for file uploads in chat
    - Set bucket as public for file access

  2. Security
    - Drop existing policies if they exist to avoid conflicts
    - Create RLS policies for authenticated users to manage chat files
    - Allow users to upload, view, and delete their own files
*/

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chat files" ON storage.objects;

-- Create storage policies for chat files
CREATE POLICY "Authenticated users can upload chat files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view chat files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own chat files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);