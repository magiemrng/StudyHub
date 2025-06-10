/*
  # Fix Chat RLS Policies

  1. Security Updates
    - Fix RLS policies for user_messages table to allow proper INSERT operations
    - Add storage policies for chat-files bucket
    - Ensure authenticated users can send messages and upload files

  2. Changes
    - Update user_messages INSERT policy to use proper auth.uid() function
    - Add storage policies for chat-files bucket
    - Ensure policies allow users to manage their own content
*/

-- Fix the user_messages INSERT policy
DROP POLICY IF EXISTS "Users can send messages to their rooms" ON user_messages;

CREATE POLICY "Users can send messages to their rooms"
  ON user_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND 
    room_id IN (
      SELECT chat_participants.room_id
      FROM chat_participants
      WHERE chat_participants.user_id = auth.uid()
    )
  );

-- Ensure the SELECT policy uses the correct function name
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON user_messages;

CREATE POLICY "Users can view messages in their rooms"
  ON user_messages
  FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT chat_participants.room_id
      FROM chat_participants
      WHERE chat_participants.user_id = auth.uid()
    )
  );

-- Ensure UPDATE and DELETE policies use correct function
DROP POLICY IF EXISTS "Users can edit their own messages" ON user_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON user_messages;

CREATE POLICY "Users can edit their own messages"
  ON user_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
  ON user_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Create storage bucket for chat files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat-files bucket
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view chat files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'chat-files');

CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Fix chat_participants policies to use correct function
DROP POLICY IF EXISTS "Allow joining and adding participants" ON chat_participants;

CREATE POLICY "Allow joining and adding participants"
  ON chat_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1
      FROM chat_rooms
      WHERE chat_rooms.id = chat_participants.room_id 
      AND chat_rooms.created_by = auth.uid()
    )
  );

-- Fix other chat_participants policies
DROP POLICY IF EXISTS "Allow leaving rooms" ON chat_participants;
DROP POLICY IF EXISTS "Allow updating own participation" ON chat_participants;

CREATE POLICY "Allow leaving rooms"
  ON chat_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow updating own participation"
  ON chat_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix chat_rooms policies
DROP POLICY IF EXISTS "Users can create rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Room creators can update their rooms" ON chat_rooms;

CREATE POLICY "Users can create rooms"
  ON chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms"
  ON chat_rooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);