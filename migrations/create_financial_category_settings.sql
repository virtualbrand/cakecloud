-- Create financial_category_settings table
-- This table stores user preferences for category display and management
CREATE TABLE IF NOT EXISTS financial_category_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Display preferences
  show_icons BOOLEAN DEFAULT true,
  show_colors BOOLEAN DEFAULT true,
  sort_by TEXT DEFAULT 'name' CHECK (sort_by IN ('name', 'usage', 'created_at', 'custom')),
  
  -- Category order (for custom sorting)
  expense_category_order UUID[] DEFAULT '{}',
  income_category_order UUID[] DEFAULT '{}',
  
  -- Budget settings per category
  enable_budget_alerts BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create category_budgets table
-- This table allows users to set monthly budgets for each category
CREATE TABLE IF NOT EXISTS financial_category_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES financial_categories(id) ON DELETE CASCADE NOT NULL,
  
  -- Budget configuration
  monthly_limit DECIMAL(10, 2) NOT NULL,
  alert_threshold INTEGER DEFAULT 80 CHECK (alert_threshold > 0 AND alert_threshold <= 100), -- Percentage
  is_active BOOLEAN DEFAULT true,
  
  -- Tracking
  current_month_spent DECIMAL(10, 2) DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, category_id)
);

-- Enable RLS
ALTER TABLE financial_category_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_category_budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_category_settings
CREATE POLICY "Users can view their own category settings"
  ON financial_category_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category settings"
  ON financial_category_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category settings"
  ON financial_category_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category settings"
  ON financial_category_settings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for financial_category_budgets
CREATE POLICY "Users can view their own category budgets"
  ON financial_category_budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category budgets"
  ON financial_category_budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category budgets"
  ON financial_category_budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category budgets"
  ON financial_category_budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_category_settings_user_id ON financial_category_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_category_budgets_user_id ON financial_category_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_category_budgets_category_id ON financial_category_budgets(category_id);

-- Create triggers for updated_at
CREATE TRIGGER update_financial_category_settings_updated_at
  BEFORE UPDATE ON financial_category_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_category_budgets_updated_at
  BEFORE UPDATE ON financial_category_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to reset monthly budget spent
CREATE OR REPLACE FUNCTION reset_monthly_category_budget()
RETURNS void AS $$
BEGIN
  UPDATE financial_category_budgets
  SET 
    current_month_spent = 0,
    last_reset_date = CURRENT_DATE
  WHERE 
    is_active = true
    AND last_reset_date < date_trunc('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Function to update category budget spent
CREATE OR REPLACE FUNCTION update_category_budget_spent()
RETURNS TRIGGER AS $$
DECLARE
  budget_record RECORD;
  month_start DATE;
  month_spent DECIMAL(10, 2);
BEGIN
  month_start := date_trunc('month', CURRENT_DATE)::DATE;

  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.category_id IS NOT NULL AND NEW.type = 'despesa' AND NEW.is_paid = true THEN
      -- Calculate total spent this month for this category
      SELECT COALESCE(SUM(amount), 0) INTO month_spent
      FROM financial_transactions
      WHERE 
        category_id = NEW.category_id
        AND user_id = NEW.user_id
        AND type = 'despesa'
        AND is_paid = true
        AND date >= month_start
        AND date < (month_start + INTERVAL '1 month');
      
      -- Update budget record if exists
      UPDATE financial_category_budgets
      SET current_month_spent = month_spent
      WHERE 
        category_id = NEW.category_id
        AND user_id = NEW.user_id
        AND is_active = true;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Update old category budget if changed
    IF OLD.category_id IS NOT NULL AND OLD.type = 'despesa' AND OLD.is_paid = true THEN
      SELECT COALESCE(SUM(amount), 0) INTO month_spent
      FROM financial_transactions
      WHERE 
        category_id = OLD.category_id
        AND user_id = OLD.user_id
        AND type = 'despesa'
        AND is_paid = true
        AND date >= month_start
        AND date < (month_start + INTERVAL '1 month');
      
      UPDATE financial_category_budgets
      SET current_month_spent = month_spent
      WHERE 
        category_id = OLD.category_id
        AND user_id = OLD.user_id
        AND is_active = true;
    END IF;
    
    -- Update new category budget
    IF NEW.category_id IS NOT NULL AND NEW.type = 'despesa' AND NEW.is_paid = true THEN
      SELECT COALESCE(SUM(amount), 0) INTO month_spent
      FROM financial_transactions
      WHERE 
        category_id = NEW.category_id
        AND user_id = NEW.user_id
        AND type = 'despesa'
        AND is_paid = true
        AND date >= month_start
        AND date < (month_start + INTERVAL '1 month');
      
      UPDATE financial_category_budgets
      SET current_month_spent = month_spent
      WHERE 
        category_id = NEW.category_id
        AND user_id = NEW.user_id
        AND is_active = true;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.category_id IS NOT NULL AND OLD.type = 'despesa' AND OLD.is_paid = true THEN
      SELECT COALESCE(SUM(amount), 0) INTO month_spent
      FROM financial_transactions
      WHERE 
        category_id = OLD.category_id
        AND user_id = OLD.user_id
        AND type = 'despesa'
        AND is_paid = true
        AND date >= month_start
        AND date < (month_start + INTERVAL '1 month');
      
      UPDATE financial_category_budgets
      SET current_month_spent = month_spent
      WHERE 
        category_id = OLD.category_id
        AND user_id = OLD.user_id
        AND is_active = true;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for category budget tracking
CREATE TRIGGER update_category_budget_spent_trigger
  AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_category_budget_spent();

-- Initialize default settings for existing users
INSERT INTO financial_category_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
