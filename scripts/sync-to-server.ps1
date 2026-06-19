# Sync local development files to the server mount (Z: -> /mnt/user/niels/dev/buttonplus-nodered)
$Source = "C:\Herd\Private projects\buttonplus-nodered"
$Target = "Z:\dev\buttonplus-nodered"

if (-not (Test-Path $Target)) {
    Write-Error "Target not found: $Target. Is the Z: drive mounted?"
    exit 1
}

robocopy $Source $Target /E /XD node_modules .git .pack-test .cursor /XF *.tgz package-lock.json

if ($LASTEXITCODE -ge 8) {
    Write-Error "Robocopy failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "Sync complete -> $Target"
