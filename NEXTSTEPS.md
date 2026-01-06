The repository has a lot of potential, but it currently feels "chaotic" due to significant technical debt, root-level clutter, and lingering features that have been semi-disabled.

Here is a recommended Spring Cleaning Plan to bring order to the codebase:

1. Root-Level Cleanup (Immediate Visual Impact)
The root directory is currently cluttered with diagnostic logs and database scripts.

Action: Create a /database or /supabase/migrations folder and move all 
.sql
 files (
campaigns_schema.sql
, 
chat_schema_update.sql
, etc.) there.
Action: Delete all 
.txt
 log files (
eslint_output.txt
, 
tsc_output.txt
, 
grep_results.txt
, etc.). These should not be tracked in the repo and contribute heavily to the "messy" feel.
Action: Move utility scripts like 
check_columns.ts
 into a /scripts directory.
2. The "Zero-Lint" Sprint
The ESLint output shows 163 problems (40 errors, 123 warnings). A noisy linter makes it impossible to spot new, real bugs.

Fix JSX Entities: A large portion of your errors are just unescaped quotes in JSX (e.g., using ' instead of &apos;). These are trivial to fix but clean up the output significantly.
Standardize UI Components: Several Shadcn/UI components have "empty interface" errors. We should fix these to keep the core components clean.
Type Safety: There are many any types in critical files like use-collabs.ts and auth/page.tsx. Replacing these with proper interfaces will prevent runtime crashes.
3. Feature Housekeeping: "Communities"
In previous sessions, you mentioned hiding the Communities feature.

Current State: The code still lives in src/app/dashboard/communities, which clutters your main application logic.
Action: If this feature is truly deprecated for now, move the entire directory to src/app/dashboard/_deprecated/communities. This keeps it out of the active routing/logic while preserving the code if you want it back later.
4. Architecture Alignment
The project is transitioning to React Query, but some pages still use manual useEffect fetching (like the onboarding page).

Action: Standardize data fetching. If you have React Query, everything should ideally go through hooks in src/hooks.
State Management: Fix the "cascading render" error in onboarding/page.tsx where state is being set directly inside an effect without proper guards.
Would you like me to start by automating the file cleanup (moving SQL and deleting logs) and then tackle the most common lint errors?

