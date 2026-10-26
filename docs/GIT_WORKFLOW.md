# Git workflow

Branches: `main` (deployed), `develop` (integration), `feature/<topic>` (one change each).

```bash
git init -b main
git add . && git commit -m "chore: initial project structure"
git remote add origin https://github.com/<you>/localbizhub.git && git push -u origin main
git switch -c develop && git push -u origin develop

# for each piece of work
git switch -c feature/nginx-reverse-proxy develop
git add frontend/nginx frontend/Dockerfile
git commit -m "feat(nginx): reverse proxy /api to backend, serve SPA"
git push -u origin feature/nginx-reverse-proxy     # open a PR into develop; CI runs on the PR
# merge develop -> main via PR when it is green; the merge deploys
```

Commit messages: `type(scope): what and why` (feat, fix, ci, docs, chore, test). Make small commits as you actually work (Docker, Compose, CI, docs, the 502 fix) so the history shows your process. Protect `main` (require PR and passing checks) under Settings → Branches.

Before the first push check that no secret is staged: `git status` should not list `.env`; `git grep -nE "password|secret" -- . ':!*.md' ':!*.example'` should show only variable names.
