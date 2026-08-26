#!/usr/bin/env bash
# Check that release-note blog posts (blog/release-*.md) match the body of the
# corresponding GitHub Release on the GreptimeDB repository.
#
# Why: the release note is published in two places — the docs blog and the
# GitHub Release body. They must stay in sync (see the v1.2.0-beta.1 incident
# where the blog was updated but the release body was not).
#
# Usage: check-release-note-sync.sh <base_sha>
#   Compares every blog/release-*.md changed between <base_sha> and HEAD
#   against the GitHub Release body of GreptimeTeam/greptimedb (override with
#   $RELEASE_REPO). The tag is derived from the filename, e.g.
#   blog/release-1-2-0-beta.1.md -> v1.2.0-beta.1.
#
# Behavior:
#   - No GitHub release for the tag yet (404): warn and skip (the blog PR may
#     legitimately land before the release is published).
#   - Release exists: the blog body (frontmatter stripped) must equal the
#     release body (CRLF-normalized). Any difference fails the check and
#     prints a diff plus the command to re-sync the release body.

set -euo pipefail

BASE_SHA="${1:?usage: check-release-note-sync.sh <base_sha>}"
RELEASE_REPO="${RELEASE_REPO:-GreptimeTeam/greptimedb}"

failed=0

for f in $(git diff --name-only "${BASE_SHA}" HEAD | grep -E '^blog/release-[^/]+\.md$' || true); do
  echo "== Checking ${f}"

  # derive the release tag from the filename:
  #   release-1-2-0-beta.1.md -> 1-2-0-beta.1 -> v1.2.0-beta.1
  tag=$(basename "${f}" .md | sed 's/^release-//' \
    | awk -F- '{printf "v%s.%s.%s", $1, $2, $3; for (i = 4; i <= NF; i++) printf "-%s", $i; print ""}')

  body=$(gh api "repos/${RELEASE_REPO}/releases/tags/${tag}" --jq '.body // empty' 2>/dev/null || true)

  if [[ -z "${body}" ]]; then
    echo "::warning::No GitHub release found for ${tag} on ${RELEASE_REPO}; skipping sync check (release may not be published yet)"
    continue
  fi

  # strip the YAML frontmatter (leading --- ... --- block) from the blog post
  blog=$(awk 'seen == 0 && /^---$/ {seen = 1; next}
              seen == 1 && /^---$/ {seen = 2; next}
              seen == 2 {print}' "${f}")

  body_norm=$(printf '%s\n' "${body}" | sed 's/\r$//')
  blog_norm=$(printf '%s\n' "${blog}" | sed 's/\r$//')

  if [[ "${body_norm}" != "${blog_norm}" ]]; then
    echo "::error::${f} differs from the GitHub release body of ${tag} on ${RELEASE_REPO}. Sync them. To copy the blog into the release body (frontmatter stripped): gh release edit ${tag} --repo ${RELEASE_REPO} --body \"\$(awk 'seen == 0 && /^---\$/ {seen = 1; next} seen == 1 && /^---\$/ {seen = 2; next} seen == 2 {print}' ${f})\" — or update the blog to match the release."
    diff -u <(printf '%s\n' "${body_norm}") <(printf '%s\n' "${blog_norm}") | head -40 || true
    failed=1
  else
    echo "OK: ${f} matches the ${tag} release body on ${RELEASE_REPO}"
  fi
done

exit "${failed}"
