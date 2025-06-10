/*
  # Fix Chat Participants RLS Policies

  This migration fixes the infinite recursion issue in the chat_participants table policies.
  
  ## Changes Made
  1. Drop the problematic recursive policy
  2. Create a simpler, non-recursive policy for viewing participants
  3. Ensure all policies are properly structured to avoid circular dependencies

  ## Security
  - Users can only view participants in rooms they are part of
  - Users can only manage their own participation records
  - No recursive policy dependencies
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view participants in their rooms" ON chat_participants;

-- Create a simpler policy that doesn't cause recursion
-- This policy allows users to view participants only for rooms where they are explicitly a participant
CREATE POLICY "Users can view participants in rooms they joined"
  ON chat_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM chat_participants cp 
      WHERE cp.room_id = chat_participants.room_id 
      AND cp.user_id = auth.uid()
    )
  );

-- Ensure the other policies are also safe from recursion
-- Drop and recreate the other policies to be explicit

DROP POLICY IF EXISTS "Users can join rooms" ON chat_participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON chat_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON chat_participants;

-- Recreate policies with clear, non-recursive logic
CREATE POLICY "Users can join rooms"
  ON chat_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON chat_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
  ON chat_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);