#!/usr/bin/env bash
# Vercel Ignored Build Step script for Main App (Astro site).
# Exit code 1 = PROCEED with build
# Exit code 0 = CANCEL/SKIP build

# If no previous commit is known (e.g. initial build), always build.
if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ] || [ -z "$VERCEL_GIT_COMMIT_SHA" ]; then
  # Fallback to checking HEAD^ vs HEAD if running in git repo
  if git rev-parse --verify HEAD^ >/dev/null 2>&1; then
    git diff --quiet HEAD^ HEAD -- . ':!studio'
    if [ $? -eq 0 ]; then
      echo "🛑 Only studio/ changed since previous commit. Skipping Main App build."
      exit 0
    else
      echo "✅ Changes outside studio/ detected. Proceeding with Main App build."
      exit 1
    fi
  fi
  echo "✅ No previous commit info. Proceeding with Main App build."
  exit 1
fi

# Check if any files outside studio/ have changed
git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" -- . ':!studio'
STATUS=$?

if [ $STATUS -eq 0 ]; then
  echo "🛑 Only studio/ changed between $VERCEL_GIT_PREVIOUS_SHA and $VERCEL_GIT_COMMIT_SHA. Skipping Main App build."
  exit 0
else
  echo "✅ Changes outside studio/ detected. Proceeding with Main App build."
  exit 1
fi
