# Quality gate: lint (ESLint, Prettier, astro check), test (Vitest), build (Astro), links (base-path check).
# Prints the success marker as a whole line only when every step passed.
$fail = $false
function Invoke-Step($name, [scriptblock]$body) {
  Write-Output "== $name"
  $global:LASTEXITCODE = 0
  $failed = $false
  try {
    $ErrorActionPreference = 'Stop'
    & $body
  } catch {
    $failed = $true
  }
  if ($failed -or $global:LASTEXITCODE -ne 0) { Write-Output "CHECK FAILED: $name"; $script:fail = $true }
}
Invoke-Step 'lint' { npm run lint }
Invoke-Step 'test' { npm test }
Invoke-Step 'build' { npm run build }
Invoke-Step 'links' { npm run check:links }
if ($fail) { exit 1 }
Write-Output 'ALL CHECKS PASSED'
