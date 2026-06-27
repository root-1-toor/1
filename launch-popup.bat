@echo off
REM Launch Winamp as a popup window in Chrome (Windows 11)
REM Run this AFTER `npm run dev` is already running

set URL=http://localhost:3000/popup

REM Try Chrome first
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --app=%URL% ^
  --window-size=295,450 ^
  --window-position=100,100 ^
  --no-default-browser-check ^
  --disable-extensions

REM Fallback: just open in default browser
REM start %URL%
