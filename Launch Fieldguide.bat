@echo off
setlocal
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="https://j-s-bot.github.io/avn-fieldguide/"
) else (
    start "" "https://j-s-bot.github.io/avn-fieldguide/"
)
exit /b 0
