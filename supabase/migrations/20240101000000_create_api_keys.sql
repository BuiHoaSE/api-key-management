-- Create api_keys table if it doesn't exist
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    key TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('dev', 'prod')),
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    usage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting api keys
CREATE POLICY select_own_api_keys ON api_keys
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy for inserting api keys
CREATE POLICY insert_own_api_keys ON api_keys
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy for updating api keys
CREATE POLICY update_own_api_keys ON api_keys
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy for deleting api keys
CREATE POLICY delete_own_api_keys ON api_keys
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at DESC); 