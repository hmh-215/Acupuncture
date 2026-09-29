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
    $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    return ($null -ne $conn)
}

while (Test-PortOccupied $port -and $port -lt 8095) {
    $port++
}

$url = "http://localhost:$port"
Write-Host "[+] Web App URL: $url" -ForegroundColor Yellow
Write-Host "[+] Dang mo trinh duyet..." -ForegroundColor Yellow
Start-Process $url

Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "  MAY CHU WEB NOI BO DANG HOAT DONG LIEN TUC (ACTIVE)" -ForegroundColor Green
Write-Host "  Dia chi: $url" -ForegroundColor Yellow
Write-Host "  Luu y:" -ForegroundColor White
Write-Host "  * Cua so nay la May chu Web dang lang nghe ket noi (KHONG bi treo/stuck)." -ForegroundColor Gray
Write-Host "  * Giu nguyen cua so nay trong suot qua trinh su dung Web App tren trinh duyet." -ForegroundColor Gray
Write-Host "  * Nhan Ctrl + C de dung may chu khi xong.`n" -ForegroundColor DarkGray
Write-Host "===========================================================`n" -ForegroundColor Cyan

if ($workingPython) {
    Write-Host "[+] Python HTTP Server ($workingPython)...`n" -ForegroundColor Gray
    & $workingPython -m http.server $port --directory $appDir
} else {
    Write-Host "[+] Native PowerShell HTTP Server...`n" -ForegroundColor Gray
    & "$appDir\server.ps1"
}
