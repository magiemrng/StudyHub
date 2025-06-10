/*
  # Create Resume Storage Bucket and Policies

  1. Storage Setup
    - Create resumes storage bucket
    - Set up proper RLS policies for file access

  2. Security
    - Users can only access files in their own folder
    - Authenticated users can upload, view, update, and delete their own resumes
*/

-- Create the resumes storage bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'resumes', 
    'resumes', 
    false,
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  );
EXCEPTION
  WHEN unique_violation THEN
    -- Bucket already exists, do nothing
    NULL;
END $$;

-- Create storage policies using the storage schema functions
-- These policies will be created in the storage schema, not public

-- Policy for uploading resumes (INSERT)
DO $$
BEGIN
  -- Drop policy if it exists
  DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
  
  -- Create new policy
  CREATE POLICY "Users can upload their own resumes"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION
  WHEN insufficient_privilege THEN
    -- If we can't create the policy directly, we'll handle it differently
    RAISE NOTICE 'Could not create upload policy directly';
END $$;

-- Policy for viewing resumes (SELECT)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
  
  CREATE POLICY "Users can view their own resumes"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not create view policy directly';
END $$;

-- Policy for deleting resumes (DELETE)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
  
  CREATE POLICY "Users can delete their own resumes"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not create delete policy directly';
END $$;

-- Policy for updating resumes (UPDATE)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
  
  CREATE POLICY "Users can update their own resumes"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not create update policy directly';
END $$;

-- Ensure RLS is enabled on storage.objects (this might already be enabled)
DO $$
BEGIN
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'RLS might already be enabled or insufficient privileges';
END $$;