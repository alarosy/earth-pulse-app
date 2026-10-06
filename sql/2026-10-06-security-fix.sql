-- Security fix — run once in Supabase SQL Editor (Dashboard → SQL Editor → New query → Run).
-- Safe to re-run.
--
-- Fixes:
--   1. Any visitor could register (or edit their own profile) with role = 'ADMIN'.
--   2. Anyone on the internet could read every profile, including students' emails.
--   3. Students could insert submissions already marked READ with a score, or with an
--      arbitrary image_url (stored XSS against the admin panel).
--   4. Storage upload rules for the `images` bucket were not in the schema.

-- 0. Helper: is the current user an admin? (SECURITY DEFINER avoids RLS recursion on profiles)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN');
$$;

-- 1. Profiles: users see only themselves, admins see everyone
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

-- 2. Profiles: a new user may only create a plain STUDENT profile with zero points
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  WITH CHECK (id = auth.uid() AND role = 'STUDENT' AND COALESCE(total_points, 0) = 0);

-- 3. Profiles: only admins may update (the site never lets students edit their profile;
--    leaving this open let them set their own role/points)
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Submissions: students can only submit unreviewed work with an image from our own bucket
DROP POLICY IF EXISTS "submissions_insert" ON submissions;
CREATE POLICY "submissions_insert" ON submissions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'UNREAD'
    AND admin_score IS NULL
    AND admin_comment IS NULL
    AND image_url LIKE 'https://hfkaumhqyeumwvfepmos.supabase.co/storage/v1/object/public/images/submissions/%'
  );

-- 5. Activities: admins may also edit (needed for future "edit news")
DROP POLICY IF EXISTS "activities_update_admin" ON activities;
CREATE POLICY "activities_update_admin" ON activities FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Storage bucket `images`: public read, admins upload to activities/, signed-in users to submissions/
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "images_admin_upload_activities" ON storage.objects;
CREATE POLICY "images_admin_upload_activities" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = 'activities' AND public.is_admin());

DROP POLICY IF EXISTS "images_admin_delete" ON storage.objects;
CREATE POLICY "images_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'images' AND public.is_admin());

DROP POLICY IF EXISTS "images_user_upload_submissions" ON storage.objects;
CREATE POLICY "images_user_upload_submissions" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = 'submissions');

-- 7. Report: every policy now in force. Screenshot this result — any policy NOT listed in
--    this file (e.g. an old "allow all" rule added from the dashboard) should be reviewed.
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename, policyname;
