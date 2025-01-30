#!/bin/bash

SCRIPT_DIR=$(dirname "$0")

sudo rm -rf "$SCRIPT_DIR/docker/local.pgdata"
sudo rm -rf "$SCRIPT_DIR/node_modules"

exit 0
