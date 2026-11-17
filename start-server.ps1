param(
    [int]$Port = 8080
)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

$syncScript = Join-Path $root "sync-nwt.ps1"
$liveFile = Join-Path $root "data\nwt-live.json"
$lastSyncTime = [DateTime]::MinValue

function Invoke-NwtSyncOnDemand {
    param([int]$MaxAgeSec = 8)
    $now = Get-Date
    if (Test-Path $liveFile) {
        $lastMod = (Get-Item $liveFile).LastWriteTime
        if (($now - $lastMod).TotalSeconds -lt $MaxAgeSec) {
            return # Fresh enough
        }
    }
    if (Test-Path $syncScript) {
        try {
            & $syncScript
        } catch {
            Write-Host "NWT on-demand sync error: $_" -ForegroundColor Red
        }
    }
}

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  NextRoute Logistics - Real-Time Server Active" -ForegroundColor Green
    Write-Host "  URL: $prefix" -ForegroundColor Yellow
    Write-Host "  Document Root: $root" -ForegroundColor Gray
    Write-Host "  NWT Live GPS Sync: Automatic Real-Time On-Demand Enabled" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server.`n"

    $mimeTypes = @{
        ".html" = "text/html; charset=utf-8"
        ".css"  = "text/css; charset=utf-8"
        ".js"   = "application/javascript; charset=utf-8"
        ".json" = "application/json; charset=utf-8"
        ".jpg"  = "image/jpeg"
        ".jpeg" = "image/jpeg"
        ".png"  = "image/png"
        ".svg"  = "image/svg+xml"
        ".ico"  = "image/x-icon"
    }

    # Initial sync on server start
    Invoke-NwtSyncOnDemand -MaxAgeSec 0

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }

        # Real-Time NWT Live GPS Telemetry Endpoint & Auto-Sync
        if ($urlPath -eq "/api/nwt/sync" -or $urlPath -eq "/data/nwt-live.json") {
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.AddHeader("Pragma", "no-cache")
            $response.ContentType = "application/json; charset=utf-8"

            # Auto sync if data is older than 8 seconds
            Invoke-NwtSyncOnDemand -MaxAgeSec 8

            if (Test-Path $liveFile) {
                $bytes = [System.IO.File]::ReadAllBytes($liveFile)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.StatusCode = 200
            } else {
                $response.StatusCode = 404
                $err = [System.Text.Encoding]::UTF8.GetBytes('{"error":"nwt-live.json not found"}')
                $response.OutputStream.Write($err, 0, $err.Length)
            }
            $response.OutputStream.Close()
            continue
        }

        $localFilePath = Join-Path $root ($urlPath.TrimStart("/").Replace("/", "\"))

        if (Test-Path $localFilePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localFilePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime

            $bytes = [System.IO.File]::ReadAllBytes($localFilePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }

        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
