# Sync — Push to GitHub & Track Progress

This phase covers pushing local epics/tasks to GitHub as issues, syncing progress as comments, and closing issues when work is done.

---

## Repository Safety Check

**Always run this before any GitHub write operation:**

```bash
remote_url=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$remote_url" == *"automazeio/ccpm"* ]]; then
  echo "❌ Cannot sync to the CCPM template repository."
  echo "Update remote: git remote set-url origin https://github.com/YOUR/REPO.git"
  exit 1
fi
REPO=$(echo "$remote_url" | sed 's|.*github.com[:/]||' | sed 's|\.git$||')
```

---

## Epic Sync — Push Epic + Tasks to GitHub

**Trigger**: User wants to push a local epic and its tasks to GitHub as issues.

### Preflight
- Verify `.claude/epics/<name>/epic.md` exists.
- Verify numbered task files exist — if none: "❌ No tasks to sync. Decompose the epic first."

### Process

**Step 1 — Create epic issue:**

Strip frontmatter from epic.md, then:
```bash
sed '1,/^---$/d; 1,/^---$/d' .claude/epics/<name>/epic.md > /tmp/epic-body.md
epic_number=$(gh issue create \
  --repo "$REPO" \
  --title "Epic: <name>" \
  --body-file /tmp/epic-body.md \
  --label "epic,epic:<name>,feature" \
  --json number -q .number)
```

**Step 2 — Create task sub-issues:**

Check if `gh-sub-issue` extension is available:
```bash
if gh extension list | grep -q "yahsan2/gh-sub-issue"; then
  use_subissues=true
fi
```

For <5 tasks: create sequentially.
For ≥5 tasks: use parallel Task agents (3-4 tasks per batch).

Per task:
```bash
sed '1,/^---$/d; 1,/^---$/d' <task_file> > /tmp/task-body.md
task_number=$(gh issue create \
  --repo "$REPO" \
  --title "<task_name>" \
  --body-file /tmp/task-body.md \
  --label "task,epic:<name>" \
  --json number -q .number)
# or with sub-issues:
# gh sub-issue create --parent $epic_number ...
```

**Step 3 — Rename task files and update references:**

After all issues are created, rename `001.md` → `<issue_number>.md` and update all `depends_on`/`conflicts_with` arrays **and body text** to use real issue numbers.

> **Windows/MSYS note**: `sed -i` silently corrupts files on this platform. Use the Python approach below — it handles both frontmatter and body, and is cross-platform.

```bash
# 1) Build mapping file (one entry per line: "001 718")
# (populated during sub-issue creation loop above)
# e.g.: echo "001 $task_number" >> /tmp/ccpm-map.txt

# 2) Write body-replacement script to a file (avoids bash $ expansion in heredoc)
cat > /tmp/fix_issue_refs.py << 'PYEOF'
import re, sys, os

# Read mapping from file: "001 718\n002 719\n..."
mapping_file = sys.argv[1]
epic_dir = sys.argv[2]
mapping = {}
for line in open(mapping_file).read().splitlines():
    parts = line.split()
    if len(parts) == 2:
        seq, inum = parts
        mapping[seq] = '#' + inum

def fix_body(text):
    for old, new in mapping.items():
        text = re.sub(r'\b' + old + r'\b', new, text)
    return text

for fname in os.listdir(epic_dir):
    if not fname.endswith('.md') or fname in ('epic.md', 'github-mapping.md'):
        continue
    fpath = os.path.join(epic_dir, fname)
    content = open(fpath, encoding='utf-8').read()
    m = re.match(r'^(---\n.*?\n---\n)(.*)', content, re.DOTALL)
    if not m:
        continue
    frontmatter, body = m.group(1), m.group(2)
    new_body = fix_body(body)
    if new_body != body:
        open(fpath, 'w', encoding='utf-8').write(frontmatter + new_body)

# Also fix epic.md: replace "001.md" → "#718" in Tasks Created section
epic_path = os.path.join(epic_dir, 'epic.md')
if os.path.exists(epic_path):
    content = open(epic_path, encoding='utf-8').read()
    original = content
    for seq, inum in mapping.items():
        # strip '#' from inum (mapping stores '#718', need '718' for filename)
        num = inum.lstrip('#')
        content = content.replace(f'{seq}.md', inum)
    if content != original:
        open(epic_path, 'w', encoding='utf-8').write(content)
PYEOF

# 3) Apply body replacement
python /tmp/fix_issue_refs.py /tmp/ccpm-map.txt .claude/epics/<name>/

# 4) Rename files and remap frontmatter depends_on/conflicts_with
while read seq inum; do
  f=".claude/epics/<name>/$seq.md"
  [ -f "$f" ] || continue
  # frontmatter remap (awk: safe cross-platform alternative to sed -i)
  awk -v old="$seq" -v new="$inum" '
    /^(depends_on|conflicts_with):/ { gsub("\"" old "\"", new) }
    { print }
  ' "$f" > /tmp/task_tmp.md && mv /tmp/task_tmp.md "$f"
  mv "$f" ".claude/epics/<name>/$inum.md"
done < /tmp/ccpm-map.txt
```

> **Verify after rename**: check that no `00[1-9]` references remain in body text:
> ```bash
> grep -rn '\b00[1-9]\b' .claude/epics/<name>/ && echo "WARN: unreplaced refs found"
> ```

**Step 4 — Update frontmatter:**
```bash
current_date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
# Update github: and updated: fields in epic.md and each task file
github_url="https://github.com/$REPO/issues/<number>"
sed -i.bak "/^github:/c\\github: $github_url" <file>
sed -i.bak "/^updated:/c\\updated: $current_date" <file>
rm <file>.bak
```

**Step 5 — Create worktree for the epic:**
```bash
git checkout main && git pull origin main
git worktree add ../epic-<name> -b epic/<name>
```

**Step 6 — Create github-mapping.md:**
```markdown
# GitHub Issue Mapping
Epic: #<N> - https://github.com/<repo>/issues/<N>
Tasks:
- #<N>: <title> - https://github.com/<repo>/issues/<N>
Synced: <datetime>
```

**Output:**
```
✅ Synced epic <name> to GitHub
  Epic: #<N>
  Tasks: N sub-issues
  Worktree: ../epic-<name>
  Next: "start working on issue <N>" or "start the <name> epic"
```

---

## Issue Sync — Post Progress to GitHub

**Trigger**: User wants to sync local development progress to a GitHub issue as a comment.

### Preflight
- Verify issue exists: `gh issue view <N> --json state`
- Check `.claude/epics/*/updates/<N>/` exists with a `progress.md` file.
- Check `last_sync` in progress.md — if synced <5 minutes ago, confirm before proceeding.

### Process

Gather updates from `.claude/epics/<epic>/updates/<N>/` (progress.md, notes.md, commits.md).

Format and post a comment:
```bash
gh issue comment <N> --body-file /tmp/update-comment.md
```

Comment format:
```markdown
## 🔄 Progress Update - <date>

### ✅ Completed Work
### 🔄 In Progress
### 📝 Technical Notes
### 📊 Acceptance Criteria Status
### 🚀 Next Steps
### ⚠️ Blockers

---
*Progress: N% | Synced at <timestamp>*
```

After posting: update `last_sync` in progress.md frontmatter, update `updated` in the task file.

Add sync marker to local files to prevent duplicate comments:
```markdown
<!-- SYNCED: <datetime> -->
```

---

## Closing an Issue

**Trigger**: User marks a task complete.

### Process

1. Find the local task file (`.claude/epics/*/<N>.md`).
2. Update frontmatter: `status: closed`, `updated: <now>`.
3. Post completion comment:
```bash
echo "✅ Task completed — all acceptance criteria met." | gh issue comment <N> --body-file -
gh issue close <N>
```
4. Check off the task in the epic issue body:
```bash
gh issue view <epic_N> --json body -q .body > /tmp/epic-body.md
sed -i "s/- \[ \] #<N>/- [x] #<N>/" /tmp/epic-body.md
gh issue edit <epic_N> --body-file /tmp/epic-body.md
```
5. Recalculate and update epic progress: `progress = closed_tasks / total_tasks * 100`

---

## Merging an Epic

**Trigger**: User wants to merge a completed epic back to main.

### Preflight
- Verify worktree `../epic-<name>` exists.
- Check for uncommitted changes in the worktree — block if dirty.
- Warn if any task issues are still open.

### Process

```bash
# From worktree: run project tests if detectable
cd ../epic-<name>
# detect and run: npm test / pytest / cargo test / go test / etc.

# From main repo:
git checkout main && git pull origin main
git merge epic/<name> --no-ff -m "Merge epic: <name>"
git push origin main

# Cleanup
git worktree remove ../epic-<name>
git branch -d epic/<name>
git push origin --delete epic/<name>

# Archive
mkdir -p .claude/epics/archived/
mv .claude/epics/<name> .claude/epics/archived/

# Close GitHub issues
epic_issue=$(grep 'github:' .claude/epics/archived/<name>/epic.md | grep -oE '[0-9]+$')
gh issue close $epic_issue -c "Epic completed and merged to main"
```

Update epic.md frontmatter: `status: completed`.

---

## Reporting a Bug Against a Completed Issue

**Trigger**: User finds a bug while testing a completed or in-progress issue — e.g. "found a bug in issue 42", "email validation is broken, came up while testing issue 42".

The workflow should stay automated: create a linked bug task without losing context from the original issue.

### Process

**Step 1 — Read the original issue for context:**
```bash
gh issue view <original_N> --json title,body,labels
```
Also read the local task file if it exists: `.claude/epics/*/<original_N>.md`

**Step 2 — Create a local bug task file:**

```markdown
---
name: Bug: <short description>
status: open
created: <run: date -u +"%Y-%m-%dT%H:%M:%SZ">
updated: <same>
github: (will be set on sync)
depends_on: []
parallel: false
conflicts_with: []
bug_for: <original_N>
---

# Bug: <short description>

## Context
Found while working on / testing issue #<original_N>: <original title>

## Description
<what's broken>

## Steps to Reproduce
<steps>

## Expected vs Actual
- Expected: 
- Actual: 

## Acceptance Criteria
- [ ] Bug is fixed
- [ ] Original issue #<original_N> behaviour is unaffected

## Effort Estimate
- Size: XS/S
```

Save to `.claude/epics/<same_epic_as_original>/bug-<original_N>-<slug>.md`

**Step 3 — Create a linked GitHub issue:**
```bash
gh issue create \
  --repo "$REPO" \
  --title "Bug: <short description>" \
  --body "$(cat /tmp/bug-body.md)" \
  --label "bug,epic:<epic_name>" \
  --json number -q .number
```

The issue body should open with `Fixes / follow-up to #<original_N>` so GitHub auto-links them.

**Step 4 — Update the local file** with the GitHub issue number and rename to `<new_N>.md`.

**Output:**
```
✅ Bug issue created: #<new_N> — "Bug: <short description>"
  Linked to: #<original_N>
  Epic: <epic_name>

Start fixing it: "start working on issue <new_N>"
```
