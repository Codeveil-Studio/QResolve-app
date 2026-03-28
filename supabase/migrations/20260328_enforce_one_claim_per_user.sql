-- Enforce 1:1 relationship: one active claim (pending or approved) per user.
-- Rejected claims are excluded so a user can re-apply after rejection.
CREATE UNIQUE INDEX IF NOT EXISTS profile_claims_user_active_uniq
ON public.profile_claims (user_id)
WHERE status IN ('pending', 'approved');
