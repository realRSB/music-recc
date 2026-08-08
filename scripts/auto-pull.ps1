# Keeps your local main in sync with the team by pulling on a timer.
# Run this in a terminal tab and just leave it running while you work.
#
# Usage:
#   .\scripts\auto-pull.ps1              (checks every 30s)
#   .\scripts\auto-pull.ps1 -IntervalSeconds 15

param(
    [int]$IntervalSeconds = 30
)

$gitDir = git rev-parse --git-dir 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "not inside a git repo, stopping."
    exit 1
}

Write-Host "auto-pull running, checking every $IntervalSeconds sec (ctrl+c to stop)"

while ($true) {
    $rebaseInProgress = (Test-Path "$gitDir/rebase-merge") -or (Test-Path "$gitDir/rebase-apply")

    if ($rebaseInProgress) {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') rebase in progress, resolve the conflict manually - pausing auto-pull"
    } else {
        $branch = git rev-parse --abbrev-ref HEAD 2>$null
        $before = git rev-parse HEAD 2>$null

        git pull --rebase --autostash origin $branch *> $null

        if ($LASTEXITCODE -ne 0) {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') pull failed - check manually with 'git status'"
        } else {
            $after = git rev-parse HEAD 2>$null
            if ($before -ne $after) {
                Write-Host "$(Get-Date -Format 'HH:mm:ss') pulled new commits on $branch"
            }
        }
    }

    Start-Sleep -Seconds $IntervalSeconds
}
