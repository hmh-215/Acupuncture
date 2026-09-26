# Run script for 3D Musculoskeletal & Acupuncture App
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$appDir = $PSScriptRoot
Set-Location $appDir

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  3D MUSCULOSKELETAL & ACUPUNCTURE INTERACTIVE WEB APP" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "Working Directory: $appDir" -ForegroundColor Gray

# Find Python executable
$pythonPaths = @(
    "C:\Users\proto\.local\bin\python3.14.exe",
    "C:\Users\proto\anaconda3\python.exe",
    "C:\Users\proto\.pymod\pymod_envs\pymod_env\python.exe"
)

$workingPython = $null
foreach ($p in $pythonPaths) {
    if (Test-Path $p) {
        $workingPython = $p
        break
    }
}

if (-not $workingPython) {
    $cmd = Get-Command python -ErrorAction SilentlyContinue
    if ($cmd) { $workingPython = $cmd.Source }
}

$port = 8080

# Function to check if port is open
function Test-PortOccupied ($p) {
    $conn = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    return ($null -ne $conn)
}

if (Test-PortOccupied $port) {
    $port = 8081
}

$url = "http://localhost:$port"
Write-Host "[+] Opening browser at: $url" -ForegroundColor Yellow
Start-Process $url

if ($workingPython) {
    Write-Host "[+] Launching Python HTTP Server using: $workingPython" -ForegroundColor Green
    Write-Host "[+] Press Ctrl + C to stop the server.`n" -ForegroundColor Gray
    & $workingPython -m http.server $port --directory $appDir
} else {
    Write-Host "[+] Launching Native PowerShell HTTP Server..." -ForegroundColor Green
    & "$appDir\server.ps1"
}
