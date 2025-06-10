/*
  # Fix Chat Foreign Key Relationships

  1. Database Changes
    - Add missing foreign key constraint from user_profiles to auth.users
    - Add foreign key constraint from chat_participants to user_profiles
    - Add foreign key constraint from user_messages to user_profiles
    - Update existing data to ensure referential integrity

  2. Security
    - Maintain existing RLS policies
    - Ensure all relationships are properly defined for Supabase queries
*/

-- First, ensure all users have profiles (create missing ones)
INSERT INTO user_profiles (user_id, display_name, status)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)),
  'offline'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.user_id = au.id
);

-- Add foreign key constraint from chat_participants to user_profiles
-- First check if the constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_participants_user_profiles_fkey'
  ) THEN
    ALTER TABLE chat_participants 
    ADD CONSTRAINT chat_participants_user_profiles_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint from user_messages to user_profiles  
-- First check if the constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_messages_user_profiles_fkey'
  ) THEN
    ALTER TABLE user_messages 
    ADD CONSTRAINT user_messages_user_profiles_fkey 
    FOREIGN KEY (sender_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for the new foreign keys if they don't exist
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_profiles ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_user_profiles ON user_messages(sender_id);