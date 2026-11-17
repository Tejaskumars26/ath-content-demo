#!/usr/bin/env bash
# Deploy the demo site to Cloud Run: live service (main) + preview service (ath/translations).
#
#   ./deploy.sh            setup (if needed) + deploy live + deploy preview + print the addresses
#   ./deploy.sh setup      one-time setup only: APIs, image repository, permissions, triggers (safe to re-run)
#   ./deploy.sh live       build THIS FOLDER and deploy it to the live service
#   ./deploy.sh preview    build the ath/translations branch (trigger) – or this folder with --local
#   ./deploy.sh urls       print the two service addresses
#
# Options / environment:
#   --local          preview: build this folder (with the PREVIEW banner) instead of the ath/translations branch
#   DRY_RUN=1        print the gcloud commands instead of running them
#   PROJECT, REGION, GITHUB_OWNER, GITHUB_REPO   override the defaults below
#
# Needs: gcloud signed in (gcloud auth login) with Owner / Editor on the project. Runs in Git Bash, macOS, Linux.
# See DEPLOY.md for what each step does.
set -euo pipefail

PROJECT="${PROJECT:-rare-shadow-276706}"
REGION="${REGION:-us-central1}"
REPOSITORY="ath-demo"
GITHUB_OWNER="${GITHUB_OWNER:-Tejaskumars26}"
GITHUB_REPO="${GITHUB_REPO:-ath-content-demo}"
LIVE_SERVICE="ath-content-demo-live"
PREVIEW_SERVICE="ath-content-demo-preview"
PREVIEW_BRANCH="ath/translations"
DRY_RUN="${DRY_RUN:-0}"

cd "$(dirname "$0")"

say()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m%s\033[0m\n' "$*" >&2; }
die()  { printf '\033[31mError: %s\033[0m\n' "$*" >&2; exit 1; }
run()  { if [ "$DRY_RUN" = 1 ]; then printf '  [dry run] gcloud %s\n' "$*"; else gcloud "$@"; fi; }
# true when the resource exists (read-only check; always "no" in a dry run)
exists() { [ "$DRY_RUN" != 1 ] && gcloud "$@" >/dev/null 2>&1; }

check_gcloud() {
  command -v gcloud >/dev/null 2>&1 || die "gcloud is not installed – https://cloud.google.com/sdk/docs/install"
  [ "$DRY_RUN" = 1 ] && return
  local account
  account="$(gcloud config get-value account 2>/dev/null || true)"
  [ -n "$account" ] || die "gcloud is not signed in – run: gcloud auth login"
  gcloud projects describe "$PROJECT" --format='value(projectId)' >/dev/null 2>&1 \
    || die "project $PROJECT not found or no access for $account"
  echo "Project $PROJECT, region $REGION, account $account"
}

project_number() {
  if [ "$DRY_RUN" = 1 ]; then echo "PROJECT_NUMBER"; else gcloud projects describe "$PROJECT" --format='value(projectNumber)'; fi
}

setup() {
  local number cb_sa run_sa
  number="$(project_number)"
  cb_sa="${number}@cloudbuild.gserviceaccount.com"            # Cloud Build's service account
  run_sa="${number}-compute@developer.gserviceaccount.com"     # identity the services run as

  say "1/4 Enabling Cloud Run, Cloud Build and Artifact Registry"
  run services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project="$PROJECT"

  say "2/4 Image repository '$REPOSITORY'"
  if exists artifacts repositories describe "$REPOSITORY" --location="$REGION" --project="$PROJECT"; then
    echo "  already exists"
  else
    run artifacts repositories create "$REPOSITORY" --repository-format=docker --location="$REGION" \
      --description="ath-content-demo images" --project="$PROJECT"
  fi

  say "3/4 Letting Cloud Build deploy to Cloud Run"
  run projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$cb_sa" --role=roles/run.admin \
    --condition=None --quiet --format=none
  run iam service-accounts add-iam-policy-binding "$run_sa" --member="serviceAccount:$cb_sa" \
    --role=roles/iam.serviceAccountUser --project="$PROJECT" --quiet --format=none

  say "4/4 Build triggers (main -> live, $PREVIEW_BRANCH -> preview)"
  create_trigger ath-demo-live    '^main$'                  "$LIVE_SERVICE"    live
  create_trigger ath-demo-preview '^ath/translations$'      "$PREVIEW_SERVICE" preview
}

create_trigger() {
  local name="$1" pattern="$2" service="$3" mode="$4"
  if exists builds triggers describe "$name" --project="$PROJECT"; then
    echo "  trigger $name already exists"
    return
  fi
  if ! run builds triggers create github --project="$PROJECT" --name="$name" \
      --repo-owner="$GITHUB_OWNER" --repo-name="$GITHUB_REPO" --branch-pattern="$pattern" \
      --build-config=cloudbuild.yaml --substitutions="_SERVICE=$service,_SITE_MODE=$mode"; then
    warn "
  Could not create trigger $name. Usually the GitHub repository is not connected to Cloud Build yet:
    Google Cloud console -> Cloud Build -> Triggers -> Connect repository -> GitHub (Cloud Build GitHub App)
    -> authorize -> choose $GITHUB_OWNER/$GITHUB_REPO
  Then run ./deploy.sh setup again. (Manual deploys with ./deploy.sh live / preview --local work without triggers.)"
    return 1
  fi
}

# Build this folder with Cloud Build (no Docker needed locally) and deploy it to a service.
submit_local() {
  local service="$1" mode="$2"
  [ -f cloudbuild.yaml ] && [ -f Dockerfile ] || die "run from the ath-content-demo folder (cloudbuild.yaml / Dockerfile missing)"
  if [ -n "$(git status --porcelain 2>/dev/null || true)" ]; then
    warn "  Note: uncommitted changes in this folder are included in this build (they are not on GitHub yet)."
  fi
  run builds submit . --project="$PROJECT" --config=cloudbuild.yaml \
    --substitutions="_SERVICE=$service,_SITE_MODE=$mode,_REGION=$REGION,_REPOSITORY=$REPOSITORY"
}

deploy_live() {
  say "Deploying this folder -> $LIVE_SERVICE (live)"
  submit_local "$LIVE_SERVICE" live
}

deploy_preview() {
  local local_build="${1:-}"
  if [ "$local_build" = "--local" ]; then
    say "Deploying this folder with the PREVIEW banner -> $PREVIEW_SERVICE"
    submit_local "$PREVIEW_SERVICE" preview
    return
  fi
  say "Building branch $PREVIEW_BRANCH -> $PREVIEW_SERVICE"
  if [ "$DRY_RUN" != 1 ] && ! git ls-remote --exit-code --heads origin "$PREVIEW_BRANCH" >/dev/null 2>&1; then
    warn "  Branch $PREVIEW_BRANCH does not exist on GitHub yet – ATH creates it on its first delivery
  (publish a review job, or Create / Update pull request in ATH). Deploying this folder with the banner instead."
    submit_local "$PREVIEW_SERVICE" preview
    return
  fi
  if exists builds triggers describe ath-demo-preview --project="$PROJECT" || [ "$DRY_RUN" = 1 ]; then
    run builds triggers run ath-demo-preview --branch="$PREVIEW_BRANCH" --project="$PROJECT"
    echo "  Build started – follow it: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT"
  else
    warn "  Trigger ath-demo-preview does not exist (run ./deploy.sh setup). Deploying this folder with the banner instead."
    submit_local "$PREVIEW_SERVICE" preview
  fi
}

urls() {
  say "Addresses"
  local s url
  for s in "$LIVE_SERVICE" "$PREVIEW_SERVICE"; do
    if [ "$DRY_RUN" = 1 ]; then echo "  $s: (dry run)"; continue; fi
    url="$(gcloud run services describe "$s" --region="$REGION" --project="$PROJECT" --format='value(status.url)' 2>/dev/null || true)"
    printf '  %-26s %s\n' "$s" "${url:-(not deployed yet)}"
  done
  echo
  echo "  Put the preview address in ATH: repository -> Edit -> Preview site address."
}

main() {
  local command="${1:-all}"
  shift || true
  case "$command" in -h|--help|help) sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'; return ;; esac
  check_gcloud
  case "$command" in
    setup)   setup ;;
    live)    deploy_live ;;
    preview) deploy_preview "${1:-}" ;;
    urls)    urls ;;
    all)
      setup || warn "Setup not complete (see above) – continuing with manual deploys."
      deploy_live
      deploy_preview "${1:-}"
      urls ;;
    *) die "unknown command '$command' – use: setup | live | preview [--local] | urls | (none = all)" ;;
  esac
}

main "$@"
