-- Run after creating a private Storage bucket named "prescriptions".
-- Files should be uploaded only after authenticated server-side validation.
-- Storage policies use the first folder segment as the patient's auth UUID.
create policy "patients_upload_own_prescriptions" on storage.objects
for insert to authenticated
with check (bucket_id='prescriptions' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "patients_read_own_prescriptions" on storage.objects
for select to authenticated
using (bucket_id='prescriptions' and (storage.foldername(name))[1]=(select auth.uid())::text);
-- Do not make this bucket public. Pharmacy access should be implemented with a server-authorized, short-lived signed URL after checking assignment and prescription workflow.
