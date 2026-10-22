#!/bin/zsh
cd "$(dirname "$0")"
python3 -m http.server 8765 --bind 127.0.0.1 >/tmp/buen-camino-server.log 2>&1 &
server_pid=$!
sleep 1
open "http://localhost:8765/"
wait "$server_pid"
