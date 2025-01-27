#!/bin/bash

SCRIPT_DIR=$(dirname "$0")
COMPOSE_FILE_DEV="$SCRIPT_DIR/docker/docker-compose-dev.yaml"
COMPOSE_FILE_START="$SCRIPT_DIR/docker/docker-compose-start.yaml"

function down_runner() {
    docker compose -f "$COMPOSE_FILE_DEV" down -v
    docker compose -f "$COMPOSE_FILE_START" down -v
}

down_runner
exit 0
