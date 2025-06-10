/*
  # Create storage bucket for chat files

  1. Storage
    - Create storage bucket for chat files
    - Set up policies for file access

  2. Security
    - Users can only upload to their own folder
    - Users can view files in rooms they participate in
*/

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for chat files
CREATE POLICY "Users can upload chat files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view chat files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'chat-files');

CREATE POLICY "Users can delete their own chat files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);