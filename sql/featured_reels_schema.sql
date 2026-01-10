-- Create featured_reels table
CREATE TABLE IF NOT EXISTS public.featured_reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.featured_reels ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read featured reels
CREATE POLICY "Featured reels are viewable by everyone" 
ON public.featured_reels FOR SELECT 
USING (true);

-- Allow users to manage their own featured reels
CREATE POLICY "Users can insert their own featured reels" 
ON public.featured_reels FOR INSERT 
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own featured reels" 
ON public.featured_reels FOR UPDATE 
USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own featured reels" 
ON public.featured_reels FOR DELETE 
USING (auth.uid() = profile_id);
