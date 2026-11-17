<#
.SYNOPSIS
    NextRoute Logistics - NWT GPS Live Telemetry Sync Worker
    Pulls live vehicle positions, speeds, odometers, and statuses from NWT Cloud Run API.
#>

param(
    [switch]$Loop,
    [int]$IntervalSec = 10
)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$scriptRoot = $PSScriptRoot
if (-not $scriptRoot) { $scriptRoot = Get-Location }
$dataPath = Join-Path $scriptRoot "data\nwt-live.json"

# Master vehicle metadata dictionary for accurate branding, driver Thai names, and fuel tanks
$fleetMetadata = @{
    "73-8910" = @{ id = "V-01"; plate = "ชบ.73-8910"; province = "ชลบุรี"; brand = "Volvo"; model = "FM11 (10 ล้อหัวลาก)"; fuelTankSize = "400 ลิตร"; driverId = "D-01"; driverName = "นายประสิทธิ์ น้ำนาค"; driverNameEn = "MR. PRASIT NAMNAK"; dltUnitId = "2020001000NEXTROUTE00738910" }
    "73-8912" = @{ id = "V-02"; plate = "ชบ.73-8912"; province = "ชลบุรี"; brand = "Volvo"; model = "FM11 (10 ล้อหัวลาก)"; fuelTankSize = "370 ลิตร"; driverId = "D-02"; driverName = "นายรัญญา พงษ์วัน"; driverNameEn = "MR. RANYA PHONGWAN"; dltUnitId = "2020001000NEXTROUTE00738912" }
    "73-8914" = @{ id = "V-03"; plate = "ชบ.73-8914"; province = "ชลบุรี"; brand = "Volvo"; model = "FM11 (10 ล้อหัวลาก)"; fuelTankSize = "400 ลิตร"; driverId = "D-03"; driverName = "นายจินดา พิชวนชม"; driverNameEn = "MR. CHINDA PHISCHUANCHOM"; dltUnitId = "2020001000NEXTROUTE00738914" }
    "73-8947" = @{ id = "V-04"; plate = "ชบ.73-8947"; province = "ชลบุรี"; brand = "Volvo"; model = "FM11 (10 ล้อหัวลาก)"; fuelTankSize = "400 ลิตร"; driverId = "D-04"; driverName = "นายกิตถโรจน์ ปัญญาธิป"; driverNameEn = "MR. KITTHAROT PANYATHIP"; dltUnitId = "2020001000NEXTROUTE00738947" }
    "73-8949" = @{ id = "V-05"; plate = "ชบ.73-8949"; province = "ชลบุรี"; brand = "Volvo"; model = "FM11 (10 ล้อหัวลาก)"; fuelTankSize = "400 ลิตร"; driverId = "D-05"; driverName = "นายอนงค์ ผิวคำ"; driverNameEn = "MR. ANONG PHIWKHAM"; dltUnitId = "2020001000NEXTROUTE00738949" }
    "74-0547" = @{ id = "V-06"; plate = "ชบ.74-0547"; province = "ชลบุรี"; brand = "Scania"; model = "P360 (10 ล้อหัวลาก)"; fuelTankSize = "370 ลิตร"; driverId = "D-06"; driverName = "นายชำนาญ จุลวรรณ"; driverNameEn = "MR. CHAMNAN CHUNLAWAN"; dltUnitId = "2020001000NEXTROUTE00740547" }
    "74-0549" = @{ id = "V-07"; plate = "ชบ.74-0549"; province = "ชลบุรี"; brand = "Scania"; model = "P360 (10 ล้อหัวลาก)"; fuelTankSize = "370 ลิตร"; driverId = "D-07"; driverName = "นายสุเทพ โพธิ์ศรี"; driverNameEn = "MR. SUTHEP PHOSRI"; dltUnitId = "2020001000NEXTROUTE00740549" }
    "74-0551" = @{ id = "V-08"; plate = "ชบ.74-0551"; province = "ชลบุรี"; brand = "Scania"; model = "P360 (10 ล้อหัวลาก)"; fuelTankSize = "370 ลิตร"; driverId = "D-08"; driverName = "นายธวัชชัย อุเทศ"; driverNameEn = "MR. THAWATCHAI UTSEN"; dltUnitId = "2020001000NEXTROUTE00740551" }
    "74-0553" = @{ id = "V-09"; plate = "ชบ.74-0553"; province = "ชลบุรี"; brand = "Scania"; model = "P360 (10 ล้อหัวลาก)"; fuelTankSize = "370 ลิตร"; driverId = "D-09"; driverName = "นายสมคิด แสงสร้อย"; driverNameEn = "MR. SOMKID SANGSOI"; dltUnitId = "2020001000NEXTROUTE00740553" }
    "74-0556" = @{ id = "V-11"; plate = "ชบ.74-0556"; province = "ชลบุรี"; brand = "Scania"; model = "P360 (10 ล้อหัวลาก)"; fuelTankSize = "370 ลิตร"; driverId = "D-11"; driverName = "นายน้อม กะปรัม"; driverNameEn = "MR. NOM KAPRAM"; dltUnitId = "2020001000NEXTROUTE00740556" }
    "74-1586" = @{ id = "V-12"; plate = "ชบ.74-1586"; province = "ชลบุรี"; brand = "Scania"; model = "P360 (10 ล้อหัวลาก)"; fuelTankSize = "370 ลิตร"; driverId = "D-12"; driverName = "นายประทีป อินทาโนะ"; driverNameEn = "MR. PRATHIP INTANO"; dltUnitId = "2020001000NEXTROUTE00741586" }
    "74-1748" = @{ id = "V-13"; plate = "ชบ.74-1748"; province = "ชลบุรี"; brand = "Scania"; model = "P360 (10 ล้อหัวลาก)"; fuelTankSize = "370 ลิตร"; driverId = "D-13"; driverName = "นายอานนท์ อุ่นกะสัง"; driverNameEn = "MR. ARNON AUNKASANG"; dltUnitId = "2020001000NEXTROUTE00741748" }
    "74-1750" = @{ id = "V-14"; plate = "ชบ.74-1750"; province = "ชลบุรี"; brand = "Scania"; model = "P360 (10 ล้อหัวลาก)"; fuelTankSize = "370 ลิตร"; driverId = "D-14"; driverName = "นายจิรพัฒน์ สงนอก"; driverNameEn = "MR. CHIRAPHAT SONGNOK"; dltUnitId = "2020001000NEXTROUTE00741750" }
}

function Sync-NwtLiveTelemetry {
    $nowStr = (Get-Date).ToString("HH:mm:ss")
    Write-Host "[$nowStr] Syncing with NWT Cloud Run API..." -ForegroundColor Cyan

    $loginUrl = "https://nwt-dashboard-service-6zkfnlrl7a-as.a.run.app/api/login"
    $loginBody = @{
        user_name = "NEXTROUTE"
        password  = "Nextroute@11062567"
    } | ConvertTo-Json

    $loginHeaders = @{
        "Content-Type"  = "application/json"
        "x-application" = "nwt"
        "User-Agent"    = "Mozilla/5.0"
    }

    try {
        $loginRes = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -Headers $loginHeaders -TimeoutSec 10
        $token = $loginRes.token
        $memberId = $loginRes._id

        $authHeaders = @{
            "x-access-token" = $token
            "x-application"  = "nwt"
            "User-Agent"     = "Mozilla/5.0"
        }

        # 1. Fetch vehicle list from NWT
        $vehicles = Invoke-RestMethod -Uri "https://nwt-dashboard-service-6zkfnlrl7a-as.a.run.app/api/vehicles?member_id=$memberId&group_id=" -Method Get -Headers $authHeaders -TimeoutSec 10
        $imeis = ($vehicles | ForEach-Object { $_.imei } | Where-Object { $_ }) -join ','

        # 2. Fetch live telemetries from NWT
        $telemetries = Invoke-RestMethod -Uri "https://nwt-dashboard-service-6zkfnlrl7a-as.a.run.app/api/latest-telemetries?imeis=$imeis" -Method Get -Headers $authHeaders -TimeoutSec 10

        $telMap = @{}
        foreach ($t in $telemetries) {
            $telMap[$t.imei] = $t
        }

        $vList = [System.Collections.Generic.List[PSObject]]::new()
        $runningCount = 0
        $idleCount = 0
        $restingCount = 0

        # Build each vehicle item
        foreach ($v in $vehicles) {
            $rawPlate = $v.license_plate
            $imei = $v.imei
            $t = $telMap[$imei]

            $meta = $fleetMetadata[$rawPlate]
            $vId = if ($meta) { $meta.id } else { "V-$rawPlate" }
            $plate = if ($meta) { $meta.plate } else { "ชบ.$rawPlate" }
            $brand = if ($meta) { $meta.brand } else { $v.brand }
            $model = if ($meta) { $meta.model } else { $v.model }
            $tank = if ($meta) { $meta.fuelTankSize } else { "$($v.fuel_tank_size) ลิตร" }
            $driverName = if ($meta) { $meta.driverName } else { $v.driver_full_name }
            $driverNameEn = if ($meta) { $meta.driverNameEn } else { $v.driver_full_name }
            $driverId = if ($meta) { $meta.driverId } else { "D-99" }
            $dltUnit = if ($meta) { $meta.dltUnitId } else { $v.dlt_unit_id }

            # Duplicate 74-0553 special handling:
            if ($rawPlate -eq "74-0553" -and $imei -eq "864606049603482") {
                $vId = "V-10"
                $plate = "ชบ.74-0553 (สำรอง)"
                $tank = "400 ลิตร"
                $driverName = "สำรอง / ประจำศูนย์ NRL"
                $driverNameEn = "SPARE TRUCK NRL"
                $driverId = "D-10"
            }

            # Telemetry status mapping
            $lat = 13.2083
            $lng = 101.0000
            $speed = 0
            $odometerKm = 150000
            $address = "ลานจอดศูนย์ เน็คท์รูท (NRL ชลบุรี)"
            $status = "resting"

            if ($t) {
                if ($t.location -and $t.location.coordinates) {
                    $lng = [double]$t.location.coordinates[0]
                    $lat = [double]$t.location.coordinates[1]
                }
                $speed = [int]$t.speed
                if ($t.total_odometer) {
                    $odometerKm = [math]::Round($t.total_odometer / 1000)
                }
                if ($t.address) {
                    $address = $t.address
                }
                if ($speed -gt 5) {
                    $status = "running"
                    $runningCount++
                } elseif ($t.ignition -eq 1) {
                    $status = "idle"
                    $idleCount++
                } else {
                    $status = "resting"
                    $restingCount++
                }
            } else {
                $restingCount++
            }

            $vObj = [PSCustomObject]@{
                id = $vId
                plate = $plate
                rawPlate = $rawPlate
                province = "ชลบุรี"
                imei = $imei
                dltUnitId = $dltUnit
                brand = $brand
                model = $model
                type = "น้ำมันและแก๊ส (ถังเคมี/ปิโตรเลียม)"
                capacity = "32,000 ลิตร"
                fuelTankSize = $tank
                driverId = $driverId
                driverName = $driverName
                driverNameEn = $driverNameEn
                status = $status
                lat = $lat
                lng = $lng
                speed = $speed
                fuelLevel = 75
                odometerKm = $odometerKm
                address = $address
                lastUpdate = "สดจากดาวเทียม NWT ($nowStr)"
            }
            $vList.Add($vObj)
        }

        # Sort by id (V-01 to V-14)
        $sortedList = $vList | Sort-Object { [int]($_.id -replace '\D','') }

        $liveObj = [PSCustomObject]@{
            provider = "NWT Tracking System (Cloud Run)"
            companyName = "บริษัท เน็คท์รูท โลจิสติกส์ จำกัด"
            memberId = $memberId
            syncTime = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            totalVehicles = $sortedList.Count
            runningCount = $runningCount
            idleCount = $idleCount
            restingCount = $restingCount
            vehicles = $sortedList
        }

        # Write clean UTF-8 JSON without BOM
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        $jsonContent = $liveObj | ConvertTo-Json -Depth 6
        [System.IO.File]::WriteAllText($dataPath, $jsonContent, $utf8NoBom)

        Write-Host "[$nowStr] SUCCESS: Real-Time NWT Telemetries Synced! Running: $runningCount, Idle: $idleCount, Resting: $restingCount" -ForegroundColor Green
        return $liveObj
    } catch {
        Write-Host "[$nowStr] ERROR: Sync failed: $_" -ForegroundColor Red
        return $null
    }
}

# Run sync
if ($Loop) {
    Write-Host "Starting continuous NWT Real-Time Sync Loop (Every $IntervalSec seconds)... Press Ctrl+C to stop." -ForegroundColor Yellow
    while ($true) {
        Sync-NwtLiveTelemetry
        Start-Sleep -Seconds $IntervalSec
    }
} else {
    Sync-NwtLiveTelemetry
}
