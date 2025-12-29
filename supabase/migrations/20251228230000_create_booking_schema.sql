/*
  # Booking System Transformation

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `customer_name` (text)
      - `customer_email` (text)
      - `booking_date` (date)
      - `start_time` (time)
      - `duration_hours` (int)
      - `total_price` (numeric)
      - `status` (text: 'pending', 'confirmed', 'cancelled')
    - `blocked_slots`
      - `id` (uuid, primary key)
      - `date` (date)
      - `start_time` (time, nullable for full day)
      - `end_time` (time, nullable for full day)
      - `reason` (text)
    - `site_content`
      - `key` (text, primary key)
      - `value` (text)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (create bookings)
    - Add policies for admin access (manage all)
*/

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  duration_hours integer NOT NULL DEFAULT 2,
  total_price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  payment_status text DEFAULT 'unpaid'
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to create bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow admins to manage bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (true);

-- Blocked Slots table
CREATE TABLE IF NOT EXISTS blocked_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  date date NOT NULL,
  start_time time,
  end_time time,
  reason text
);

ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read blocked slots"
  ON blocked_slots
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admins to manage blocked slots"
  ON blocked_slots
  FOR ALL
  TO authenticated
  USING (true);

-- Site Content table
CREATE TABLE IF NOT EXISTS site_content (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read content"
  ON site_content
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admins to manage content"
  ON site_content
  FOR ALL
  TO authenticated
  USING (true);

-- Initial Content
INSERT INTO site_content (key, value)
VALUES 
  ('payment_policy', 'Half Downpayment or full for reservation and non refundable'),
  ('pricing_min_hours', '2'),
  ('pricing_rate_per_hour', '1000')
ON CONFLICT (key) DO NOTHING;
