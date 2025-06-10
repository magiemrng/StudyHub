/*
  # Fix RLS policies for chat participants

  1. Security Updates
    - Update INSERT policy for chat_participants to allow users to add themselves to rooms
    - Update INSERT policy to allow room creators to add other participants
    - Ensure users can join rooms they create or are invited to

  2. Policy Changes
    - Modified "Allow joining rooms" policy to be more permissive for room creation scenarios
    - Added logic to allow room creators to add participants during room setup
*/

-- Drop existing INSERT policy for chat_participants
DROP POLICY IF EXISTS "Allow joining rooms" ON chat_participants;

-- Create new INSERT policy that allows:
-- 1. Users to add themselves to any room
-- 2. Room creators to add other users to rooms they created
CREATE POLICY "Allow joining and adding participants"
  ON chat_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can add themselves to any room
    auth.uid() = user_id
    OR
    -- Room creator can add other users to their rooms
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = room_id 
      AND chat_rooms.created_by = auth.uid()
    )
  );

-- Ensure the existing policies remain intact
-- Update SELECT policy to be more explicit
DROP POLICY IF EXISTS "Allow viewing participants" ON chat_participants;

CREATE POLICY "Allow viewing participants"
  ON chat_participants
  FOR SELECT
  TO authenticated
  USING (true);

-- Update UPDATE policy
DROP POLICY IF EXISTS "Allow updating own participation" ON chat_participants;

CREATE POLICY "Allow updating own participation"
  ON chat_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update DELETE policy  
DROP POLICY IF EXISTS "Allow leaving rooms" ON chat_participants;

CREATE POLICY "Allow leaving rooms"
  ON chat_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);