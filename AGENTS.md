# AGENTS.md

Rules for AI agents (Claude, Codex, etc.) working in this repo. This is a hackathon project with 3 people on the team — read this before making changes. More rules will get added as we go.

## Git workflow

1. **Commit and push constantly.** Every change gets committed and pushed right away, no matter how small — a one-line fix, a single component, whatever. Don't sit on work waiting for a "full feature" to be done. We want the commit history to show steady progress the whole hackathon.

2. **Commit as the human, not as the agent.**
   - Use the git identity already set on this machine (`juanmendoza-dev` / juanmendoza6159@gmail.com). Don't touch `user.name` / `user.email`.
   - Do **not** add `Co-Authored-By: Claude` or any AI co-author trailer.
   - Do **not** mention Claude, Codex, AI, or "generated with" anywhere in the message.

3. **Write commit messages like a person typing fast, not a changelog bot.**
   - Short, casual, no strict `feat:` / `fix:` / `chore:` prefixes.
   - Vary the phrasing, don't reuse the same template every time.
   - A small typo or dropped word here and there is fine — it should read like someone committing between other things, not a generated log.
   - Bad: `feat: implement user authentication module with JWT support`
   - Good: `added login, jwt auth working now`

4. **All commits must be verified (signed).** This machine is set up to sign commits automatically (SSH signing via `commit.gpgsign`), so as long as you don't override `user.email` or the signing config, commits will carry the "Verified" badge on GitHub. Don't run `git commit --no-gpg-sign` or otherwise disable signing. If a commit shows up as "Unverified" on GitHub despite carrying a signature (`git cat-file commit <sha> | grep gpgsig`), it's an account-side issue, not a repo issue — the SSH key needs to be added under GitHub Settings → SSH and GPG keys as a **Signing Key** (not just an Authentication key), and the committer email needs to be a verified email on that account.

5. **Enforcement for rule 2** is not just convention — `.claude/settings.json` sets `attribution.commit: ""` so Claude Code never writes the trailer in the first place, and `.githooks/commit-msg` hard-blocks any commit message mentioning Claude/Codex/AI or an AI co-author trailer as a backstop. Run `npm install` once (or `git config core.hooksPath .githooks` directly) to wire the hook up locally — it won't fire until you do.

## Staying in sync
Run `scripts/auto-pull.ps1` in a terminal tab and leave it running while you work — it does `git pull --rebase --autostash` every 30s so nobody's branch drifts far from main, and pauses itself if a conflict needs manual resolving. Agents: pull (`git pull --rebase`) before starting any task too, don't assume main is what you last saw. This plus rule 1 is what keeps 3 people on the same branch feeling fast — it's still git, not a live doc, so if you're actually pairing on the same file at the same time use VS Code Live Share instead.

## Before committing
- Run whatever tests/build exist for the part of the code you touched.
- Never commit secrets, `.env` files, or credentials.
- Push immediately after committing so the other two teammates see it.

## Scope
Applies to every agent working in this repo. Check this file again before assuming these are the only rules — it'll grow.
