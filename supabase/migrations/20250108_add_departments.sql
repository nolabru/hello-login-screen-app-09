-- Migration: Add company departments functionality
-- Date: 2025-01-08
-- Description: Creates departments table and adds department_id to user_profiles

-- 1. Create company_departments table
CREATE TABLE IF NOT EXISTS company_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id INTEGER NOT NULL,  -- ✅ Corrigido para INTEGER (tipo correto)
  name VARCHAR(255) NOT NULL,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add department_id column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS department_id UUID;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_departments_company 
  ON company_departments(company_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_department 
  ON user_profiles(department_id);

-- 4. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_departments_updated_at
  BEFORE UPDATE ON company_departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Create default "Geral" department for existing companies
INSERT INTO company_departments (company_id, name, status)
SELECT DISTINCT 
  CAST(company_id AS INTEGER), 
  'Geral' as name, 
  'active' as status
FROM user_profiles
WHERE company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM company_departments 
    WHERE company_id = CAST(user_profiles.company_id AS INTEGER)
  )
ON CONFLICT DO NOTHING;
