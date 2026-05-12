# Documentation Rules

After completing a feature or bug fix, automatically run `/doc` to generate docs in `docs/`.
`/doc` is a local command in `.claude/commands/doc.md`. Follow directly — no Skill tool needed.
Determine document type from commit messages and code patterns only, not branch name.

## Bugfix Document (`bugfix-*.md`)

Write as **WHY → HOW & WHY THIS → RESULT**:

1. **Problem**
   - Symptom: what situation caused what problem (user perspective)
   - Root cause: why the bug occurred at the code level (problematic code + flow)
2. **Solution**
   - Chosen approach and reasoning (before/after code)
   - Alternatives considered but rejected — and why
3. **Result** — UX changes, behavior changes, prevention points

## Feature Document (`feature-*.md`)

1. **Background** — what limitation existed, what user problem it solves
2. **Implementation**
   - Core approach and reasoning (key code + implementation flow)
   - Alternative approaches considered — and why not chosen
3. **Result** — what became possible (user and developer perspective)
