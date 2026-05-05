@echo off
setlocal enabledelayedexpansion

cd /d %~dp0

echo [1/5] Installing dependencies
call npm --prefix logging_middleware install
call npm --prefix notification_app_be install
call npm --prefix notification_app_fe install

echo [2/5] Building logging middleware
call npm --prefix logging_middleware run build

echo [3/5] Syncing frontend env
call node scripts\sync-frontend-env.cjs

echo [4/5] Starting backend (nodemon)
start "backend" cmd /k "cd /d %~dp0 && npm --prefix notification_app_be run dev"

echo [5/5] Starting frontend (vite)
start "frontend" cmd /k "cd /d %~dp0 && npm --prefix notification_app_fe run dev"

echo Servers started in separate terminals.
endlocal
