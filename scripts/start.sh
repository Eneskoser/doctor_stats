#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if tmux is installed
if ! command_exists tmux; then
    echo "tmux is not installed. Please install it first."
    echo "On macOS: brew install tmux"
    echo "On Ubuntu: sudo apt-get install tmux"
    exit 1
fi

# Kill existing session if it exists
tmux kill-session -t doctor_stats 2>/dev/null

# Create a new tmux session
tmux new-session -d -s doctor_stats

# Split the window into three panes
tmux split-window -h
tmux split-window -v

# Start Redis in the first pane (if not already running)
tmux send-keys -t doctor_stats:0.0 'redis-cli ping >/dev/null 2>&1 || redis-server' C-m

# Start backend in the second pane
tmux send-keys -t doctor_stats:0.1 'cd "$(dirname "$0")/.." && source venv/bin/activate && PYTHONPATH=$PWD uvicorn app.main:app --reload --port 8001' C-m

# Start frontend in the third pane
tmux send-keys -t doctor_stats:0.2 'cd frontend && npm run dev' C-m

# Attach to the session
tmux attach-session -t doctor_stats 