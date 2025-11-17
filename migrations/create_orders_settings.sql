-- Create table for order statuses
CREATE TABLE IF NOT EXISTS orders_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create table for order categories
CREATE TABLE IF NOT EXISTS orders_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create table for order tags
CREATE TABLE IF NOT EXISTS orders_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE orders_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for orders_statuses
CREATE POLICY "Users can view their own statuses"
  ON orders_statuses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statuses"
  ON orders_statuses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statuses"
  ON orders_statuses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own statuses"
  ON orders_statuses FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for orders_categories
CREATE POLICY "Users can view their own categories"
  ON orders_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON orders_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON orders_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON orders_categories FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for orders_tags
CREATE POLICY "Users can view their own tags"
  ON orders_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
  ON orders_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON orders_tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON orders_tags FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_statuses_user_id ON orders_statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_categories_user_id ON orders_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_tags_user_id ON orders_tags(user_id);
