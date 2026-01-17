-- Allow null sender_id for guest inquiries
ALTER TABLE public.collab_requests ALTER COLUMN sender_id DROP NOT NULL;

-- Update insert policy to allow guest inquiries (where sender_id is null)
DROP POLICY IF EXISTS "Users can insert requests" ON public.collab_requests;

CREATE POLICY "Anyone can insert requests"
  ON public.collab_requests FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = (sender_id)::uuid) OR
    (auth.uid() IS NULL AND sender_id IS NULL)
  );
