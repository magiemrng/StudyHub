/*
  # Create storage policies for resume uploads

  1. Storage Policies
    - Enable RLS on storage.objects table for resumes bucket
    - Add policy for authenticated users to upload their own resumes
    - Add policy for authenticated users to view their own resumes
    - Add policy for authenticated users to delete their own resumes

  2. Storage Bucket
    - Ensure resumes bucket exists with proper configuration
*/

-- Create the resumes storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for uploading resumes (INSERT)
CREATE POLICY "Users can upload their own resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for viewing resumes (SELECT)
CREATE POLICY "Users can view their own resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting resumes (DELETE)
CREATE POLICY "Users can delete their own resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for updating resumes (UPDATE)
CREATE POLICY "Users can update their own resumes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);