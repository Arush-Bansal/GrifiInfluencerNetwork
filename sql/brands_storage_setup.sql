-- Create the 'brands' bucket for past collaboration logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('brands', 'brands', true)
ON CONFLICT (id) DO NOTHING;

-- Create the 'reels' bucket for featured reel thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('reels', 'reels', true)
ON CONFLICT (id) DO NOTHING;

-- 1. Policies for 'brands' bucket
CREATE POLICY "Public Access: Brands"
ON storage.objects FOR SELECT
USING ( bucket_id = 'brands' );

CREATE POLICY "Authenticated users can upload brands"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'brands' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can edit their brands"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'brands' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their brands"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'brands' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Policies for 'reels' bucket
CREATE POLICY "Public Access: Reels"
ON storage.objects FOR SELECT
USING ( bucket_id = 'reels' );

CREATE POLICY "Authenticated users can upload reels"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'reels' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can edit their reels"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'reels' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their reels"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'reels' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
