/*
  # Fix Chat Policies Infinite Recursion

  1. Security Changes
    - Drop all existing problematic policies on chat_participants
    - Create new, simple policies that avoid recursion
    - Ensure chat functionality works without infinite loops

  2. Policy Updates
    - Simple participant viewing policy
    - Clear join/leave/update policies
    - No recursive references in policy conditions
*/

-- Drop all existing policies on chat_participants to start fresh
DROP POLICY IF EXISTS "Users can view participants in rooms they joined" ON chat_participants;
DROP POLICY IF EXISTS "Users can view participants in their rooms" ON chat_participants;
DROP POLICY IF EXISTS "Users can join rooms" ON chat_participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON chat_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON chat_participants;

-- Create simple, non-recursive policies

-- Allow users to view participants in any room (simplest approach)
CREATE POLICY "Allow viewing participants"
  ON chat_participants
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to join rooms (insert their own participation)
CREATE POLICY "Allow joining rooms"
  ON chat_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to leave rooms (delete their own participation)
CREATE POLICY "Allow leaving rooms"
  ON chat_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to update their own participation
CREATE POLICY "Allow updating own participation"
  ON chat_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also ensure chat_rooms policies are simple
DROP POLICY IF EXISTS "Users can view rooms they participate in" ON chat_rooms;

CREATE POLICY "Allow viewing rooms"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure other chat_rooms policies exist
DO $$
BEGIN
  -- Check if policies exist, if not create them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_rooms' 
    AND policyname = 'Room creators can update their rooms'
  ) THEN
    CREATE POLICY "Room creators can update their rooms"
      ON chat_rooms
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_rooms' 
    AND policyname = 'Users can create rooms'
  ) THEN
    CREATE POLICY "Users can create rooms"
      ON chat_rooms
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;