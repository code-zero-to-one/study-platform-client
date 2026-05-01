# Claude Commands & Skills

## Local Command Priority

Always use local commands over global skills.

| Task | Use | Do not use |
|------|-----|-----------|
| Figma → component + story | `/design-to-dev` | manual Figma inspection |
| Code review | `/review` | `coderabbit:review`, `code-review:code-review` |
| Commit | `/commit` | `sc:git`, `everything-claude-code:*` |
| Create PR | `/pr` | `pr-creator` agent |
| PR screenshot attach | `/pr-screenshot` | — |
| Feature complete pipeline | `/ship` | manual lint → commit → doc sequence |
| Generate docs | `/doc` | `sc:document` |
| Implementation | `/implement` | `sc:implement`, `everything-claude-code:plan` |
| Explain concepts | `/explain` | `sc:explain` |
| Trusted references | `/ref` | — |

`sc:*` (SuperClaude) and `everything-claude-code:go-*`, `everything-claude-code:springboot-*` are not used in this project.

Exceptionally allowed `sc:` commands (no local equivalent):

| Command | Purpose |
|---------|---------|
| `sc:research` | Deep web research (different from `/ref` which attaches citations) |
| `sc:brainstorm` | Requirements exploration and ideation |
| `sc:estimate` | Development effort estimation |

## Frequently Used Commands

```bash
/design-to-dev <figma-url>  # Figma → component + story + visual comparison → commit
/commit          # lint:fix → prettier:fix → typecheck → generate commit message → commit
/ship            # lint:fix → prettier:fix → typecheck → (chrome verify) → commit → doc (all in one)
/review          # auto-detect changed files → 13-criteria review + project-specific agents
/review-pr <#>   # CodeRabbit comment accept/reject + independent review + fix plan
/pr              # auto-create GitHub PR targeting develop
/pr-screenshot   # take localhost:3000 screenshots and attach to current PR comment
/explain <topic> # explain framework concept with project code examples
/doc             # auto-generate docs/ documentation after task completion
/ref <task>      # perform task or attach MDN/OWASP/official doc citations
```

## Browser Verification

Staging URL: `https://test.zeroone.it.kr`

"Check in Chrome (study id: XXX)" triggers Chrome DevTools MCP auto-verification:

- Group study detail: `/group-study/{id}`
- Mission tab: `/group-study/{id}?tab=mission`
- Evaluation tab: `/group-study/{id}?tab=evaluation`

## Commit Review Agent

Auto-activates on: "check if this commit has issues", "check changes have logic problems", etc.
Reviews against: OpenAPI priority, queryKey patterns, staleTime 60s conventions.
