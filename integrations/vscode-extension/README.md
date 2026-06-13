# VS Code Extension Stub

Phase 7 belongs here. The extension should:

- Listen for active editor file changes.
- Call `POST /analyse` with `{ repo_id, file_path }`.
- Render danger, expert, and capsule data in a sidebar.
- Send chat questions to `POST /query`.

Keep the extension thin; all scoring logic stays in Python.
