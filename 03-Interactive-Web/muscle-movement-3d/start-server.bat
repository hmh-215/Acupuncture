@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& { Set-Location -LiteralPath '%~dp0'; & '.\run.ps1' }"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [!] Co loi xay ra khi chay script.
    pause
)
