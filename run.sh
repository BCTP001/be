#!/bin/bash

SCRIPT_DIR=$(dirname "$0")
COMPOSE_FILE_DEV="$SCRIPT_DIR/docker/docker-compose-dev.yaml"
COMPOSE_FILE_START="$SCRIPT_DIR/docker/docker-compose-start.yaml"
OPT_DEV=""
OPT_RESET_DB=""
OPT_DETACH=""

function usage() {
    cat <<EOM
Usage: $0 [options]
Options:
  -d, --dev             Run in development mode
  -D, --detach          Run in detached mode
  -r, --reset-db        Reset the database before running
EOM
    exit 1
}

function set_options() {
    OPT_DEV="false"
    OPT_RESET_DB="false"
    OPT_DETACH="false"
    while [ "${1:-}" != "" ]; do
        case "$1" in
            -d | --dev)
                OPT_DEV="true"
                ;;
            -r | --reset-db)
                OPT_RESET_DB="true"
                ;;
            -D | --detach)
                OPT_DETACH="true"
                ;;
            -h | --help)
                usage
                exit 0
                ;;
            *)
                usage
                ;;
        esac
        shift
    done
}

function reset_db() {
    sudo rm -rf "$SCRIPT_DIR/docker/local.pgdata"
}

function down_runner() {
    docker compose -f "$COMPOSE_FILE_DEV" down -v
    docker compose -f "$COMPOSE_FILE_START" down -v
}

function run_dev() {
    COMPOSE_FILE="$COMPOSE_FILE_START"
    if [ "$OPT_DEV" = "true" ]; then
        COMPOSE_FILE="$COMPOSE_FILE_DEV"
    fi
    # echo "$COMPOSE_FILE"
    if [ "$OPT_DETACH" = "true" ]; then    
        docker compose -f "$COMPOSE_FILE" up -d
    else
        docker compose -f "$COMPOSE_FILE" up
    fi
}

set_options "$@"
if [ "$OPT_RESET_DB" = "true" ]; then
    reset_db
fi
down_runner
run_dev

exit 0
