/*
  # User-to-User Chat System

  1. New Tables
    - `chat_rooms` - Chat rooms/conversations between users
    - `chat_participants` - Users participating in chat rooms
    - `user_messages` - Messages sent between users
    - `user_profiles` - Extended user profiles for chat

  2. Security
    - Enable RLS on all tables
    - Users can only see rooms they participate in
    - Users can only send messages to rooms they're in
*/

-- User profiles for chat system
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  status text DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chat rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  description text,
  is_group boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Chat participants
CREATE TABLE IF NOT EXISTS chat_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- User messages
CREATE TABLE IF NOT EXISTS user_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  edited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view rooms they participate in"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT room_id FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms"
  ON chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms"
  ON chat_rooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for chat_participants
CREATE POLICY "Users can view participants in their rooms"
  ON chat_participants
  FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  );

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
  USING (auth.uid() = user_id);

-- RLS Policies for user_messages
CREATE POLICY "Users can view messages in their rooms"
  ON user_messages
  FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their rooms"
  ON user_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    room_id IN (
      SELECT room_id FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can edit their own messages"
  ON user_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
  ON user_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_room_id ON user_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_sender_id ON user_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Function to update room's updated_at when new message is sent
CREATE OR REPLACE FUNCTION update_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms 
  SET updated_at = now() 
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update room timestamp
DROP TRIGGER IF EXISTS update_room_timestamp_trigger ON user_messages;
CREATE TRIGGER update_room_timestamp_trigger
  AFTER INSERT ON user_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_room_timestamp();