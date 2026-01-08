-- Fix Foreign Key references for collab_requests to point to public.profiles instead of auth.users
-- This allows PostgREST to join collab_requests with profiles.

ALTER TABLE public.collab_requests
DROP CONSTRAINT IF EXISTS collab_requests_sender_id_fkey,
DROP CONSTRAINT IF EXISTS collab_requests_receiver_id_fkey;

ALTER TABLE public.collab_requests
ADD CONSTRAINT collab_requests_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(id);

ALTER TABLE public.collab_requests
ADD CONSTRAINT collab_requests_receiver_id_fkey
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id);
