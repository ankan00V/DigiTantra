#!/bin/zsh
set -euo pipefail

OUT_DIR="/tmp/digitantra-verify"
mkdir -p "$OUT_DIR"

run_page() {
  local slug="$1"
  local url="$2"
  local open_chat="$3"
  local shot="$OUT_DIR/${slug}.png"
  local report="$OUT_DIR/${slug}.txt"

  osascript <<OSA >/tmp/${slug}_report.txt
tell application "Safari"
  activate
  if (count of windows) = 0 then
    make new document
  end if
  set bounds of front window to {40, 60, 1320, 940}
  set URL of front document to "$url"
end tell
delay 8
tell application "Safari"
  set launcherVisible to do JavaScript "Array.from(document.querySelectorAll(\"button\")).some(button => { const text = (((button.innerText || \"\") + \" \" + (button.getAttribute(\"aria-label\") || \"\")).toLowerCase()); return text.includes(\"ask on this page\") || text.includes(\"open ai saarthi chat\") || text.includes(\"close ai saarthi chat\"); })" in front document
  set tidioFrames to do JavaScript "Array.from(document.querySelectorAll(\"iframe\")).filter(frame => (frame.src || \"\").includes(\"tidio\") || (frame.src || \"\").includes(\"code.tidio\")).length" in front document
  set tidioScript to do JavaScript "Array.from(document.scripts).some(script => (script.src || \"\").includes(\"tidio\"))" in front document
  if "$open_chat" is equal to "true" then
    do JavaScript "(() => { const button = Array.from(document.querySelectorAll(\"button\")).find(button => { const text = (((button.innerText || \"\") + \" \" + (button.getAttribute(\"aria-label\") || \"\")).toLowerCase()); return text.includes(\"ask on this page\") || text.includes(\"open ai saarthi chat\"); }); if (button) { button.click(); return true; } return false; })()" in front document
  end if
end tell
delay 3
tell application "Safari"
  set chatPanelVisible to do JavaScript "document.body.innerText.toLowerCase().includes(\"ai saarthi\")" in front document
  return (launcherVisible as text) & tab & (chatPanelVisible as text) & tab & (tidioFrames as text) & tab & (tidioScript as text)
end tell
OSA

  mv /tmp/${slug}_report.txt "$report"
  screencapture -x -R "40,60,1280,880" "$shot"
}

run_page "home" "http://127.0.0.1:9002/" "true"
run_page "contact" "http://127.0.0.1:9002/contact" "false"
run_page "ai-enclave" "http://127.0.0.1:9002/ai-enclave" "true"
run_page "resume-builder" "http://127.0.0.1:9002/ai-enclave/resume-builder" "true"
run_page "debug-helper" "http://127.0.0.1:9002/ai-enclave/debug-helper" "true"

for file in "$OUT_DIR"/*.txt; do
  slug="$(basename "$file" .txt)"
  IFS=$'\t' read -r launcher chatPanel tidioFrames tidioScript < "$file"
  printf '%s\tlauncher=%s\tchatPanel=%s\ttidioFrames=%s\ttidioScript=%s\n' "$slug" "$launcher" "$chatPanel" "$tidioFrames" "$tidioScript"
done
