#!/bin/bash
# Launch Winamp popup on macOS / Linux
URL="http://localhost:3000/popup"

# macOS Chrome
if [ -d "/Applications/Google Chrome.app" ]; then
  open -a "Google Chrome" --args --app="$URL" --window-size=295,450
# Linux Chrome
elif command -v google-chrome &>/dev/null; then
  google-chrome --app="$URL" --window-size=295,450 &
else
  open "$URL"
fi
