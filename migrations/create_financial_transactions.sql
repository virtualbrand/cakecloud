-- Create financial_accounts table
CREATE TABLE IF NOT EXISTS financial_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('conta-corrente', 'poupanca', 'cartao-credito', 'dinheiro')),
  initial_balance DECIMAL(10, 2) DEFAULT 0,
  current_balance DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financial_categories table
CREATE TABLE IF NOT EXISTS financial_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  color TEXT,
  icon TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financial_transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT true,
  observation TEXT,
  tags TEXT[] DEFAULT '{}',
  attachment_url TEXT,
  
  -- Recurrence fields
  is_recurring BOOLEAN DEFAULT false,
  recurrence_type TEXT CHECK (recurrence_type IN ('fixa', 'parcelada')),
  parent_transaction_id UUID REFERENCES financial_transactions(id) ON DELETE CASCADE,
  installment_number INTEGER,
  total_installments INTEGER,
  installment_period TEXT CHECK (installment_period IN ('Meses', 'Semanas')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_account_id ON financial_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category_id ON financial_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_parent ON financial_transactions(parent_transaction_id);

CREATE INDEX IF NOT EXISTS idx_financial_accounts_user_id ON financial_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_categories_user_id ON financial_categories(user_id);

-- Enable RLS
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_transactions
CREATE POLICY "Users can view their own transactions"
  ON financial_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON financial_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON financial_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON financial_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for financial_accounts
CREATE POLICY "Users can view their own accounts"
  ON financial_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
  ON financial_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON financial_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON financial_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for financial_categories
CREATE POLICY "Users can view their own categories"
  ON financial_categories FOR SELECT
  USING (auth.uid() = user_id OR is_system = true);

CREATE POLICY "Users can insert their own categories"
  ON financial_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON financial_categories FOR UPDATE
  USING (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete their own categories"
  ON financial_categories FOR DELETE
  USING (auth.uid() = user_id AND is_system = false);

-- Insert default categories for receita
INSERT INTO financial_categories (user_id, name, type, is_system, color)
SELECT 
  auth.users.id,
  categories.name,
  'receita'::text,
  true,
  categories.color
FROM auth.users
CROSS JOIN (VALUES
  ('Vendas', '#10b981'),
  ('Serviços', '#059669'),
  ('Empréstimos', '#34d399'),
  ('Investimentos', '#047857'),
  ('Outras Receitas', '#6ee7b7')
) AS categories(name, color)
ON CONFLICT DO NOTHING;

-- Insert default categories for despesa
INSERT INTO financial_categories (user_id, name, type, is_system, color)
SELECT 
  auth.users.id,
  categories.name,
  'despesa'::text,
  true,
  categories.color
FROM auth.users
CROSS JOIN (VALUES
  -- Custos fixos essenciais
  ('Aluguel', '#ef4444'),
  ('Energia', '#f97316'),
  ('Água', '#3b82f6'),
  ('Telefone', '#8b5cf6'),
  ('Internet', '#6366f1'),
  ('Contabilidade', '#0ea5e9'),
  -- Custos de produção
  ('Ingredientes', '#dc2626'),
  ('Embalagens', '#ea580c'),
  -- Pessoal
  ('Salários', '#f59e0b'),
  ('Pró-labore', '#eab308'),
  -- Financeiro
  ('Banco e taxas', '#78716c'),
  ('Impostos e taxas', '#71717a'),
  ('Dívidas e empréstimos', '#b91c1c'),
  -- Marketing e vendas
  ('Marketing', '#a855f7'),
  ('Anúncios', '#c026d3'),
  ('Apps e software', '#ec4899'),
  -- Operacional
  ('Transporte', '#06b6d4'),
  ('Manutenção', '#14b8a6'),
  ('Compras gerais', '#10b981'),
  -- Outros
  ('Outras Despesas', '#6b7280')
) AS categories(name, color)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_accounts_updated_at
  BEFORE UPDATE ON financial_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_categories_updated_at
  BEFORE UPDATE ON financial_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to update account balance when transaction is created/updated/deleted
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.account_id IS NOT NULL AND NEW.is_paid = true THEN
      UPDATE financial_accounts
      SET current_balance = current_balance + 
        CASE 
          WHEN NEW.type = 'receita' THEN NEW.amount
          ELSE -NEW.amount
        END
      WHERE id = NEW.account_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Remove old transaction from balance
    IF OLD.account_id IS NOT NULL AND OLD.is_paid = true THEN
      UPDATE financial_accounts
      SET current_balance = current_balance - 
        CASE 
          WHEN OLD.type = 'receita' THEN OLD.amount
          ELSE -OLD.amount
        END
      WHERE id = OLD.account_id;
    END IF;
    
    -- Add new transaction to balance
    IF NEW.account_id IS NOT NULL AND NEW.is_paid = true THEN
      UPDATE financial_accounts
      SET current_balance = current_balance + 
        CASE 
          WHEN NEW.type = 'receita' THEN NEW.amount
          ELSE -NEW.amount
        END
      WHERE id = NEW.account_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.account_id IS NOT NULL AND OLD.is_paid = true THEN
      UPDATE financial_accounts
      SET current_balance = current_balance - 
        CASE 
          WHEN OLD.type = 'receita' THEN OLD.amount
          ELSE -OLD.amount
        END
      WHERE id = OLD.account_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for account balance update
CREATE TRIGGER update_account_balance_trigger
  AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance();
