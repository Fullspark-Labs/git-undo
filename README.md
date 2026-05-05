# git-undo

<p align="center">
  <a href="https://www.npmjs.com/package/@fullsparklabs/git-undo">
    <img src="https://img.shields.io/npm/v/@fullsparklabs/git-undo.svg" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/@fullsparklabs/git-undo">
    <img src="https://img.shields.io/npm/dm/@fullsparklabs/git-undo.svg" alt="npm downloads">
  </a>
  <a href="https://github.com/Fullspark-Labs/git-undo/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/@fullsparklabs/git-undo.svg" alt="license">
  </a>
</p>

Safely undo git operations with confirmations. Never lose code again.

## Why git-undo?

- **Safe** - Confirms before any destructive action
- **Trackable** - Keeps history of all undo operations
- **Flexible** - Works with commits, pushes, merges, stashes

## Installation

```bash
npm install -g @fullsparklabs/git-undo
```

Or use directly:

```bash
npx @fullsparklabs/git-undo commit
```

## Usage

### Undo a Commit

```bash
# Interactive - shows recent commits and asks which to undo
git-undo commit

# Output:
# 📋 Recent Commits:
# 1. abc1234 fix: login bug
# 2. def5678 feat: add user
# 3. ghi9012 chore: update deps
# Commit to undo (hash or number): 2
# Undo commit def5678? [y/N] y
# ✅ Undo complete.
```

### Undo a Push

```bash
git-undo push
# Shows commits to push, asks how many to revert
```

### Undo a Merge

```bash
git-undo merge
# Shows recent merge commits, asks which to undo
```

### View History

```bash
git-undo history

# Output:
# 📋 Undo History:
# 1. undo-push - 2024-01-15
#    reverted 2 commits
# 2. undo-commit - 2024-01-14
#    abc1234
```

## Examples

| Situation | Command |
|-----------|---------|
| Accidental commit | `git-undo commit` |
| Pushed wrong code | `git-undo push` |
| Wrong merge | `git-undo merge` |
| Dropped stash | `git-undo stash` |
| What did I undo? | `git-undo history` |

## Commands

| Command | Description |
|---------|-------------|
| `commit` | Undo a commit (go back in time) |
| `push` | Undo a push (revert remote) |
| `merge` | Undo a merge |
| `stash` | Drop a stash |
| `history` | Show undo history |

## License

MIT