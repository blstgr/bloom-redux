#!/bin/bash
# Launches Storybook on iOS simulator and Android emulator in sync.
# Both devices connect to the same Metro websocket — selecting a story on
# one device automatically navigates the other.
#
# Usage: npm run storybook:sync
# Requires: iOS Simulator and Android Emulator already open.

cleanup() {
  echo ""
  echo "Stopping Storybook..."
  kill "$METRO_PID" 2>/dev/null || true
  wait "$METRO_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

echo "Starting Metro (Storybook mode)..."
STORYBOOK_ENABLED=true npx react-native start --reset-cache &
METRO_PID=$!

echo "Waiting for Metro to be ready..."
MAX_RETRIES=60
RETRIES=0
until curl -s http://localhost:8081/status | grep -q "packager-status:running" 2>/dev/null; do
  sleep 1
  RETRIES=$((RETRIES + 1))
  if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
    echo "Metro failed to start after ${MAX_RETRIES}s" >&2
    exit 1
  fi
  if ! kill -0 "$METRO_PID" 2>/dev/null; then
    echo "Metro process died unexpectedly" >&2
    exit 1
  fi
done
echo "Metro ready."

echo "Building iOS..."
STORYBOOK_ENABLED=true npx react-native run-ios --no-packager &
IOS_PID=$!

echo "Building Android..."
STORYBOOK_ENABLED=true npx react-native run-android --no-packager &
ANDROID_PID=$!

wait "$IOS_PID"
wait "$ANDROID_PID"

echo "Both apps launched. Select a story on either device to sync."
wait "$METRO_PID"
