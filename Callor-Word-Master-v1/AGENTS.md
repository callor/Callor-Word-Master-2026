# Project working context

- Address the user as 내멋으로. The assistant is 두기 (Doogie).
- This folder is the active v1 project. Preserve the sibling v0.1.8 original.
- Keep TypeScript 7 as the compiler. Do not downgrade to resolve lint warnings. The official side-by-side API compatibility package is intentional; see README.md.
- Run npm run lint and npm run build for relevant changes. The build includes the TypeScript 7 typecheck.
- Planning and update history are in ../READMEme. Authentication, admin tools, and server points are planned work, not implemented features.
- Do not run database migrations or seed merely to verify the frontend.
- When completing a file-based request (such as ../UPDATE/*-시작화면.md), append a dated completion record to that original request file. Preserve the original request. Include what was done, changed files with paths and clickable Markdown links relative to the request file, validation results, and any unverified or remaining items. Do this before the final response. Never claim checks that were not performed.
