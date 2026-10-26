# Submission checklist (Ventrix DevOps task)

Things only you can do (they need your accounts, cloud, and signature):

- [ ] Create the GitHub repo, push with `main`/`develop`/feature branches and real commits ([GIT_WORKFLOW.md](GIT_WORKFLOW.md))
- [ ] Run `npm install` once in `backend/` and commit `backend/package-lock.json`; run the stack locally and fix anything that breaks (this code has not been executed yet)
- [ ] Add GitHub secrets, make CI green, and capture a red run (a deliberately failing test on a throwaway branch)
- [ ] Launch EC2, run `deploy/ec2-setup.sh`, create the server `.env`, deploy, put the **live URL** in README
- [ ] Run the 502 drill and fill in `TROUBLESHOOTING_REPORT.md` with your real output
- [ ] Take the screenshots listed in `docs/screenshots/README.md`
- [ ] Replace the `<you>` / `<EC2-PUBLIC-IP>` placeholders in README
- [ ] Read `.github/workflows/ci-cd.yml`, `docker-compose*.yml` and `frontend/nginx/default.conf` well enough to explain each line: the declaration says the work is reviewed through Git history, deployment configuration and a **technical discussion**
- [ ] Fill in and sign the candidate declaration

Known gaps versus the brief: image upload (images are URLs), owner/admin dashboards in the React UI, HTTPS.
