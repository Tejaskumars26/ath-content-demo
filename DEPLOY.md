# Deploying the demo: live, preview and draft sites (Cloud Run)

Three Cloud Run services, each rebuilt automatically by Cloud Build when its branch changes:

| Service | Branch | Shows |
|---|---|---|
| `ath-content-demo-live` | `main` | What is merged – the live site |
| `ath-content-demo-preview` | `ath/translations` | The site with the translations of ATH's open pull request (yellow **PREVIEW** banner) |
| `ath-content-demo-draft` | `ath/preview` | Reviewers' **unpublished** edits – written by **Preview my edits** in ATH (blue **DRAFT** banner) |

ATH rewrites `ath/translations` from `main` on every delivery, so the preview always = latest `main` + the
translations; `ath/preview` is rewritten from `main` on every *Preview my edits*. The addresses never change. In ATH:
repository → Edit → **Site preview** On → *Draft preview address* = the draft service, *Pull request preview address* =
the preview service.

Files: `Dockerfile` (Next.js standalone server, port 8080), `cloudbuild.yaml` (build → push → deploy the
service named in `_SERVICE`), `next.config.mjs` (`output: "standalone"`).

## Quick way: `deploy.sh`

```bash
gcloud auth login            # once
./deploy.sh                  # setup (safe to re-run) + deploy live, preview and draft + print the addresses
./deploy.sh setup            # only the one-time setup below (steps 1, 2 and 4)
./deploy.sh live             # build THIS folder (incl. uncommitted changes) -> live service
./deploy.sh preview          # build the ath/translations branch -> preview service (this folder if the branch doesn't exist yet)
./deploy.sh preview --local  # build this folder with the PREVIEW banner -> preview service
./deploy.sh draft            # build the ath/preview branch -> draft service (this folder if the branch doesn't exist yet)
./deploy.sh draft --local    # build this folder with the DRAFT banner -> draft service
./deploy.sh urls             # the three addresses
DRY_RUN=1 ./deploy.sh        # print the commands without running anything
```

Step 3 (connecting GitHub to Cloud Build) is done in the browser; until then the script still deploys all
services from this folder and tells you the triggers are missing. Builds run on Cloud Build, so Docker is not
needed locally. `.gcloudignore` keeps `node_modules/` and `.next/` out of the upload.

## One-time setup by hand (project `rare-shadow-276706`, region `us-central1`)

```bash
PROJECT=rare-shadow-276706
REGION=us-central1
CB_SA=818247973279@cloudbuild.gserviceaccount.com          # Cloud Build's service account
RUN_SA=818247973279-compute@developer.gserviceaccount.com   # identity the services run as

# 1. Image repository
gcloud artifacts repositories create ath-demo --repository-format=docker --location=$REGION --project=$PROJECT

# 2. Let Cloud Build deploy to Cloud Run
gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$CB_SA --role=roles/run.admin
gcloud iam service-accounts add-iam-policy-binding $RUN_SA --member=serviceAccount:$CB_SA --role=roles/iam.serviceAccountUser --project=$PROJECT
```

3. **Connect the GitHub repository to Cloud Build** (browser, once): Google Cloud console → Cloud Build →
   Triggers → **Connect repository** → GitHub (Cloud Build GitHub App) → authorize → choose
   `Tejaskumars26/ath-content-demo`. (This is Cloud Build's own GitHub app, separate from the ATH app.)

```bash
# 4. Three triggers, same build file
gcloud builds triggers create github --project=$PROJECT --name=ath-demo-live \
  --repo-owner=Tejaskumars26 --repo-name=ath-content-demo --branch-pattern='^main$' \
  --build-config=cloudbuild.yaml --substitutions=_SERVICE=ath-content-demo-live,_SITE_MODE=live

gcloud builds triggers create github --project=$PROJECT --name=ath-demo-preview \
  --repo-owner=Tejaskumars26 --repo-name=ath-content-demo --branch-pattern='^ath/translations$' \
  --build-config=cloudbuild.yaml --substitutions=_SERVICE=ath-content-demo-preview,_SITE_MODE=preview

gcloud builds triggers create github --project=$PROJECT --name=ath-demo-draft \
  --repo-owner=Tejaskumars26 --repo-name=ath-content-demo --branch-pattern='^ath/preview$' \
  --build-config=cloudbuild.yaml --substitutions=_SERVICE=ath-content-demo-draft,_SITE_MODE=draft
```

5. **Commit and push** `Dockerfile`, `.dockerignore`, `cloudbuild.yaml`, `next.config.mjs`, the Layout change
   and this file to `main` → the live trigger builds and deploys `ath-content-demo-live` (≈ 3–5 min).
6. The preview builds the next time ATH delivers (publish a review job, or **Create / Update pull request**
   in ATH) – `ath/translations` is then re-created from the new `main`, so it contains these files.
   To build it right away instead: `gcloud builds triggers run ath-demo-preview --branch=ath/translations --project=$PROJECT`
   (only after a delivery made from the new `main`).
7. The draft site builds the first time a reviewer clicks **Preview my edits** in ATH (Site preview on). Until
   then `./deploy.sh draft` deploys this folder with the DRAFT banner so the address exists.

## Addresses

```bash
gcloud run services describe ath-content-demo-live    --region=$REGION --project=$PROJECT --format='value(status.url)'
gcloud run services describe ath-content-demo-preview --region=$REGION --project=$PROJECT --format='value(status.url)'
gcloud run services describe ath-content-demo-draft   --region=$REGION --project=$PROJECT --format='value(status.url)'
```

Put the preview address in ATH: repository → Settings → **Preview site address**.

## Cost

Both services scale to zero when nobody visits (`--min-instances=0`, max 2, 512 MB). Each push to either branch
costs one build of a few minutes. The first visit after a quiet period takes a few seconds to start.

## Local check

```bash
NEXT_PUBLIC_SITE_MODE=preview npm run build   # 72 pages, all languages
# run like the container: copy .next/static and content/ next to .next/standalone/server.js, then
PORT=8080 node .next/standalone/server.js
```
