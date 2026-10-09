# Siêu máy chủ HTTP cục bộ bằng PowerShell thuần (không cần Python, không cần Node.js)
$port = 8080
$prefix = "http://localhost:$port/"
$folder = $PSScriptRoot

if (-not (Test-Path $folder)) {
    $folder = Get-Location
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " Máy chủ Web cục bộ đang chạy tại: $prefix" -ForegroundColor Green
    Write-Host " Thư mục phục vụ: $folder" -ForegroundColor Yellow
    Write-Host " Nhấn Ctrl + C để dừng máy chủ" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan
} catch {
    Write-Host "[!] Khong the mo cong ${port}: $_" -ForegroundColor Red
    Write-Host "[!] Dang thu cong thay the 8081..." -ForegroundColor Yellow
    $port = 8081
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    Write-Host " Máy chủ Web chạy tại: $prefix" -ForegroundColor Green
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".glb"  = "model/gltf-binary"
    ".gltf" = "model/gltf+json"
    ".obj"  = "text/plain"
    ".fbx"  = "application/octet-stream"
    ".mp4"  = "video/mp4"
    ".webm" = "video/webm"
    ".ogg"  = "video/ogg"
    ".mp3"  = "audio/mpeg"
    ".wav"  = "audio/wav"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath) -or $urlPath -eq "/") {
            $urlPath = "index.html"
        }

        # Tránh directory traversal
        $filePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($folder, $urlPath))
        if (-not $filePath.StartsWith($folder)) {
            $response.StatusCode = 403
            $response.Close()
            continue
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = $mimeTypes[$ext]
            if ($null -eq $mime) { $mime = "application/octet-stream" }
            $response.ContentType = $mime

            # Header CORS & Caching cho tài nguyên 3D & Media lớn
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Accept-Ranges", "bytes")
            if ($ext -in @(".fbx", ".glb", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".mp4", ".webm", ".mp3")) {
                $response.AddHeader("Cache-Control", "public, max-age=604800")
            } else {
                $response.AddHeader("Cache-Control", "no-cache")
            }

            $fileInfo = New-Object System.IO.FileInfo($filePath)
            $totalLength = $fileInfo.Length
            $rangeHeader = $request.Headers["Range"]

            if (-not [string]::IsNullOrEmpty($rangeHeader) -and $rangeHeader.StartsWith("bytes=")) {
                $range = $rangeHeader.Substring(6).Split("-")
                $start = [long]::Parse($range[0])
                $end = if (-not [string]::IsNullOrEmpty($range[1])) { [long]::Parse($range[1]) } else { $totalLength - 1 }
                if ($end -ge $totalLength) { $end = $totalLength - 1 }
                $chunkSize = $end - $start + 1

                $response.StatusCode = 206
                $response.AddHeader("Content-Range", "bytes $start-$end/$totalLength")
                $response.ContentLength64 = $chunkSize

                $fs = [System.IO.File]::OpenRead($filePath)
                try {
                    [void]$fs.Seek($start, [System.IO.SeekOrigin]::Begin)
                    $buffer = New-Object byte[] 65536
                    $bytesRemaining = $chunkSize
                    while ($bytesRemaining -gt 0) {
                        $toRead = [int][Math]::Min($buffer.Length, $bytesRemaining)
                        $read = $fs.Read($buffer, 0, $toRead)
                        if ($read -le 0) { break }
                        $response.OutputStream.Write($buffer, 0, $read)
                        $bytesRemaining -= $read
                    }
                } finally {
                    $fs.Close()
                }
            } else {
                $response.StatusCode = 200
                $response.ContentLength64 = $totalLength
                $fs = [System.IO.File]::OpenRead($filePath)
                try {
                    $fs.CopyTo($response.OutputStream)
                } finally {
                    $fs.Close()
                }
            }
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.Close()
    } catch {
        # Bỏ qua lỗi ngắt kết nối
    }
}
