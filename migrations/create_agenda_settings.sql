-- Create table for agenda statuses
CREATE TABLE IF NOT EXISTS agenda_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create table for agenda categories
CREATE TABLE IF NOT EXISTS agenda_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create table for agenda tags
CREATE TABLE IF NOT EXISTS agenda_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE agenda_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for agenda_statuses
CREATE POLICY "Users can view their own statuses"
  ON agenda_statuses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statuses"
  ON agenda_statuses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statuses"
  ON agenda_statuses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own statuses"
  ON agenda_statuses FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for agenda_categories
CREATE POLICY "Users can view their own categories"
  ON agenda_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON agenda_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON agenda_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON agenda_categories FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for agenda_tags
CREATE POLICY "Users can view their own tags"
  ON agenda_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
  ON agenda_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON agenda_tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON agenda_tags FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agenda_statuses_user_id ON agenda_statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_agenda_categories_user_id ON agenda_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_agenda_tags_user_id ON agenda_tags(user_id);
