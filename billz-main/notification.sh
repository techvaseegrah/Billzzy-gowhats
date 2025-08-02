#!/bin/bash

# Define host (adjust port if necessary)
HOST="http://localhost:3000"

# Use environment variable for log directory if set; default to project logs folder
LOG_DIR="${LOG_DIR:-/var/www/nextjs/logs}"
LOG_FILE="${LOG_DIR}/notification.log"

# Log the current date/time and API call status
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Executing notification API" >> "$LOG_FILE"
curl -X POST "${HOST}/api/mandate/notification" -H "Content-Type: application/json" >> "$LOG_FILE" 2>&1
echo "" >> "$LOG_FILE"

