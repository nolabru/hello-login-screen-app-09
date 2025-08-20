-- Create questionnaire system tables
-- Migration: 20240818071100_create_questionnaire_system.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for questionnaire templates
CREATE TABLE questionnaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL, -- Array of question objects
    frequency VARCHAR(50) DEFAULT 'weekly', -- weekly, monthly, quarterly
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table for questionnaire responses
CREATE TABLE questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    department VARCHAR(100),
    responses JSONB NOT NULL, -- Array of response objects with question_id and answer
    completion_status VARCHAR(20) DEFAULT 'completed', -- completed, partial, abandoned
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for questionnaire analytics (aggregated data)
CREATE TABLE questionnaire_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    department VARCHAR(100),
    total_sent INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    total_partial INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.0,
    average_score DECIMAL(5,2),
    analytics_data JSONB, -- Detailed analytics per question
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(questionnaire_id, company_id, period_start, period_end, department)
);

-- Table for questionnaire notifications/reminders
CREATE TABLE questionnaire_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) DEFAULT 'reminder', -- reminder, deadline, completion
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_questionnaires_company_id ON questionnaires(company_id);
CREATE INDEX idx_questionnaires_status ON questionnaires(status);
CREATE INDEX idx_questionnaire_responses_questionnaire_id ON questionnaire_responses(questionnaire_id);
CREATE INDEX idx_questionnaire_responses_user_id ON questionnaire_responses(user_id);
CREATE INDEX idx_questionnaire_responses_company_id ON questionnaire_responses(company_id);
CREATE INDEX idx_questionnaire_responses_department ON questionnaire_responses(department);
CREATE INDEX idx_questionnaire_responses_completion_status ON questionnaire_responses(completion_status);
CREATE INDEX idx_questionnaire_analytics_questionnaire_id ON questionnaire_analytics(questionnaire_id);
CREATE INDEX idx_questionnaire_analytics_company_id ON questionnaire_analytics(company_id);
CREATE INDEX idx_questionnaire_analytics_period ON questionnaire_analytics(period_start, period_end);
CREATE INDEX idx_questionnaire_notifications_user_id ON questionnaire_notifications(user_id);
CREATE INDEX idx_questionnaire_notifications_scheduled_at ON questionnaire_notifications(scheduled_at);
CREATE INDEX idx_questionnaire_notifications_status ON questionnaire_notifications(status);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Simplified - no user_profiles dependency)

-- Questionnaires policies
CREATE POLICY "Authenticated users can manage questionnaires" ON questionnaires
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Questionnaire responses policies  
CREATE POLICY "Users can manage their own responses" ON questionnaire_responses
    FOR ALL USING (auth.uid() = user_id);

-- Questionnaire analytics policies
CREATE POLICY "Authenticated users can view analytics" ON questionnaire_analytics
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Questionnaire notifications policies
CREATE POLICY "Users can manage their own notifications" ON questionnaire_notifications
    FOR ALL USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_questionnaires_updated_at 
    BEFORE UPDATE ON questionnaires 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaire_analytics_updated_at 
    BEFORE UPDATE ON questionnaire_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Default questionnaire template will be created programmatically
-- when needed, as it requires an existing company user

-- Grant necessary permissions
GRANT ALL ON questionnaires TO authenticated;
GRANT ALL ON questionnaire_responses TO authenticated;
GRANT ALL ON questionnaire_analytics TO authenticated;
GRANT ALL ON questionnaire_notifications TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
