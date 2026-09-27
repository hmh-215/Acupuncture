@echo off
chcp 65001 >nul
echo ============================================================
echo   KHOI DONG UNG DUNG 3D HE CO & CHAM CUU
echo ============================================================
echo Dang khoi dong may chu web cuc bo va mo trinh duyet...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& { Set-Location -LiteralPath '%~dp003-Interactive-Web\muscle-movement-3d'; & '.\run.ps1' }"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [!] Co loi xay ra khi khoi dong. Vui long kiem tra lai.
    pause
)
