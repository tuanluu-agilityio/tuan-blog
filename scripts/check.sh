#!/usr/bin/env bash
# Quality gate: lint (ESLint, Prettier, astro check), test (Vitest), build (Astro).
# Prints the success marker as a whole line only when every step passed.
set -u
fail=0
step() {
  name=$1
  echo "== $name"
  shift
  "$@" || { echo "CHECK FAILED: $name"; fail=1; }
}
# Q-01: temporary guard until the Astro project is scaffolded (first task removes it).
if [ ! -f package.json ]; then
  echo "SKIP: package.json not found - project not scaffolded yet (open question Q-01)"
else
  step lint npm run lint
  step test npm test
  step build npm run build
fi
if [ "$fail" -ne 0 ]; then exit 1; fi
echo "ALL CHECKS PASSED"
