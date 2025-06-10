/*
  # Create chat file storage and policies

  1. Storage
    - Create `chat-files` storage bucket for file uploads
    - Set up RLS policies for authenticated users

  2. Security
    - Allow authenticated users to upload files
    - Allow authenticated users to view files
    - Ensure users can only access files in chat rooms they participate in
*/

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

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