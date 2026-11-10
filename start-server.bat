@echo off
title NextRoute Logistics Server
echo Starting NextRoute Logistics Local Server...
powershell -ExecutionPolicy Bypass -File "%~dp0start-server.ps1" -Port 8080
pause
