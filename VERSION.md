# TribeFit Stable Baseline

**Current target commit:** `a08fd7b` — Remove redundant 'Schedule Today' button from calendar bottom bar

This commit is the stable rollback baseline. Later commits introduced layout, animation, and authentication instabilities, so `main` was reset to this point and the differences were committed on top of the remote tip to avoid a force push.

## Notes

- This version predates the anime.js hero entrance, lazy-loaded modals, and the Supabase UUID fixes.
- The working tree matches `a08fd7b`.
- New features should be developed on a branch and merged after they are verified.
