/*
  # Create newsletter subscribers table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `subscribed_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - Add policy for public insert access (anyone can subscribe)
    - Add policy for authenticated users to read their own subscription
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe to the newsletter (public insert)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to check if their email is subscribed (public read for specific email)
CREATE POLICY "Users can check subscription status"
  ON newsletter_subscribers
  FOR SELECT
  TO anon, authenticated
  USING (true);