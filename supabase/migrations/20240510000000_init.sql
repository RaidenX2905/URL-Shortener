CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Allow all for public access (adjust if auth added later)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'links' AND policyname = 'Public Access'
    ) THEN
        CREATE POLICY "Public Access" ON links FOR ALL USING (true);
    END IF;
END
$$;
