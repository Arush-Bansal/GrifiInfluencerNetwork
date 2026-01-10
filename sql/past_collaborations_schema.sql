-- Create past_collaborations table
CREATE TABLE IF NOT EXISTS public.past_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    brand_logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.past_collaborations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles can view past collaborations"
    ON public.past_collaborations
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own past collaborations"
    ON public.past_collaborations
    FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own past collaborations"
    ON public.past_collaborations
    FOR UPDATE
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own past collaborations"
    ON public.past_collaborations
    FOR DELETE
    USING (auth.uid() = profile_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS past_collaborations_profile_id_idx ON public.past_collaborations(profile_id);
