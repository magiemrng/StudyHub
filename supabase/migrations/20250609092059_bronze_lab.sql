/*
  # Student Offers System

  1. New Tables
    - `student_offers`
      - `id` (uuid, primary key)
      - `title` (text, offer title)
      - `description` (text, offer description)
      - `image_url` (text, offer image)
      - `offer_link` (text, link to the offer)
      - `price` (text, price information)
      - `discount_percentage` (integer, discount amount)
      - `category` (text, offer category)
      - `is_active` (boolean, whether offer is active)
      - `expires_at` (timestamp, expiration date)
      - `created_by` (uuid, admin who created it)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `student_offers` table
    - Add policy for public read access
    - Add policy for admin management
*/

CREATE TABLE IF NOT EXISTS student_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  offer_link text NOT NULL,
  price text,
  discount_percentage integer DEFAULT 0,
  category text NOT NULL DEFAULT 'general',
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_offers ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active offers
CREATE POLICY "Anyone can view active offers"
  ON student_offers
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Allow authenticated users to create offers (you can restrict this to admin users later)
CREATE POLICY "Authenticated users can create offers"
  ON student_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow creators to manage their own offers
CREATE POLICY "Users can manage their own offers"
  ON student_offers
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_offers_category ON student_offers(category);
CREATE INDEX IF NOT EXISTS idx_student_offers_active ON student_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_student_offers_expires_at ON student_offers(expires_at);
CREATE INDEX IF NOT EXISTS idx_student_offers_created_by ON student_offers(created_by);

-- Add constraints
ALTER TABLE student_offers ADD CONSTRAINT check_discount_percentage 
  CHECK (discount_percentage >= 0 AND discount_percentage <= 100);