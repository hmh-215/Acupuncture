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
    Write-Host "[!] Không thể mở cổng $port: $_" -ForegroundColor Red
    Write-Host "[!] Đang thử cổng thay thế 8081..." -ForegroundColor Yellow
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

            # Header CORS & Caching cho tài nguyên 3D lớn
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            if ($ext -in @(".fbx", ".glb", ".png", ".jpg", ".jpeg", ".svg", ".ico")) {
                $response.AddHeader("Cache-Control", "public, max-age=604800")
            } else {
                $response.AddHeader("Cache-Control", "no-cache")
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
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
