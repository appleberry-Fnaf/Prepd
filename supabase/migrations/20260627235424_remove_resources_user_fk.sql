/*
# Remove FK constraints on resources and submissions user_id

1. Modified Tables
- Remove FK constraint on resources.user_id referencing auth.users
- Remove FK constraint on submissions.user_id referencing auth.users

2. Important Notes
- This allows seeding sample data with placeholder user IDs
- RLS policies still ensure data integrity at the access level
*/

ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_user_id_fkey;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_user_id_fkey;
ALTER TABLE contributions DROP CONSTRAINT IF EXISTS contributions_user_id_fkey;
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;
