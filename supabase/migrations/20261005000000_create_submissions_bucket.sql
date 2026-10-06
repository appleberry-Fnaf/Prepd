-- Create the pdf-contributions storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-contributions',
  'pdf-contributions',
  true,
  10485760, -- 10 MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to their own folder
DROP POLICY IF EXISTS "auth_upload_pdf_contributions" ON storage.objects;
CREATE POLICY "auth_upload_pdf_contributions" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pdf-contributions' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update/replace their own files
DROP POLICY IF EXISTS "auth_update_pdf_contributions" ON storage.objects;
CREATE POLICY "auth_update_pdf_contributions" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'pdf-contributions' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own files
DROP POLICY IF EXISTS "auth_delete_pdf_contributions" ON storage.objects;
CREATE POLICY "auth_delete_pdf_contributions" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'pdf-contributions' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read (so moderators and anyone with the link can view PDFs)
DROP POLICY IF EXISTS "public_read_pdf_contributions" ON storage.objects;
CREATE POLICY "public_read_pdf_contributions" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'pdf-contributions');
