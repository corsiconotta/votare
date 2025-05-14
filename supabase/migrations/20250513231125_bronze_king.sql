/*
  # Initial schema for Romanian Parliament Vote Tracker

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `role` (text)
      - `created_at` (timestamp)
    - `mps`
      - `id` (uuid, primary key)
      - `name` (text)
      - `party` (text)
      - `chamber` (text, enum: 'DEPUTIES' or 'SENATE')
      - `region` (text)
      - `imageUrl` (text, optional)
      - `bio` (text, optional)
      - `contactEmail` (text, optional)
    - `votes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `chamber` (text, enum: 'DEPUTIES' or 'SENATE')
      - `date` (timestamp)
      - `topics` (text[])
      - `result` (text, enum: 'PASSED' or 'FAILED')
      - `totalFor` (integer)
      - `totalAgainst` (integer)
      - `totalAbstain` (integer)
      - `totalAbsent` (integer)
    - `vote_records`
      - `id` (uuid, primary key)
      - `mpId` (uuid, foreign key to mps.id)
      - `voteId` (uuid, foreign key to votes.id)
      - `position` (text, enum: 'FOR', 'AGAINST', 'ABSTAIN', 'ABSENT')

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users with appropriate roles
    - Public read-only policies for public data

  3. Functions
    - Function to get MPs without any vote records
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'editor',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

-- Create MPs table
CREATE TABLE IF NOT EXISTS mps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  party text NOT NULL,
  chamber text NOT NULL CHECK (chamber IN ('DEPUTIES', 'SENATE')),
  region text NOT NULL,
  imageUrl text,
  bio text,
  contactEmail text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MPs are readable by everyone"
  ON mps
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert MPs"
  ON mps
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update MPs"
  ON mps
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete MPs"
  ON mps
  FOR DELETE
  TO authenticated
  USING (true);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  chamber text NOT NULL CHECK (chamber IN ('DEPUTIES', 'SENATE')),
  date timestamptz NOT NULL,
  topics text[] NOT NULL DEFAULT '{}',
  result text NOT NULL CHECK (result IN ('PASSED', 'FAILED')),
  totalFor integer NOT NULL DEFAULT 0,
  totalAgainst integer NOT NULL DEFAULT 0,
  totalAbstain integer NOT NULL DEFAULT 0,
  totalAbsent integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are readable by everyone"
  ON votes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert votes"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update votes"
  ON votes
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete votes"
  ON votes
  FOR DELETE
  TO authenticated
  USING (true);

-- Create vote_records table
CREATE TABLE IF NOT EXISTS vote_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mpId uuid NOT NULL REFERENCES mps(id) ON DELETE CASCADE,
  voteId uuid NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  position text NOT NULL CHECK (position IN ('FOR', 'AGAINST', 'ABSTAIN', 'ABSENT')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mpId, voteId)
);

ALTER TABLE vote_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vote records are readable by everyone"
  ON vote_records
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert vote records"
  ON vote_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vote records"
  ON vote_records
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete vote records"
  ON vote_records
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to get MPs without vote records
CREATE OR REPLACE FUNCTION get_mps_without_votes()
RETURNS SETOF mps AS $$
BEGIN
  RETURN QUERY
  SELECT m.*
  FROM mps m
  WHERE NOT EXISTS (
    SELECT 1
    FROM vote_records vr
    WHERE vr.mpId = m.id
  );
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_mps
BEFORE UPDATE ON mps
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_votes
BEFORE UPDATE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_vote_records
BEFORE UPDATE ON vote_records
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();