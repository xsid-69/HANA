-- Code-word safety RLS policy for Supabase.
-- Drizzle Kit creates the code_words and evidence_log tables from db/schema.js.
-- Copy the SQL inside this block into the Supabase SQL Editor after `npm run db:push`.
--
-- Application ADMIN users are members of Supabase's `authenticated` role and therefore
-- cannot update or delete evidence directly. The role-checked server action uses the
-- private backend database connection solely to change the adminReviewed workflow flag.

/*
ALTER TABLE public.evidence_log ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON TABLE public.evidence_log TO authenticated;
REVOKE UPDATE, DELETE ON TABLE public.evidence_log FROM anon, authenticated;

DROP POLICY IF EXISTS "authenticated users can append evidence" ON public.evidence_log;
CREATE POLICY "authenticated users can append evidence"
ON public.evidence_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Intentionally create no UPDATE or DELETE policy. With RLS enabled and privileges
-- revoked above, anon and authenticated users (including application ADMIN users)
-- cannot modify or delete evidence rows through Supabase.
*/
