#!/usr/bin/env bash
# Run on the server (SSH) after syncing files to /mnt/user/niels/dev/buttonplus-nodered
set -euo pipefail

CONTAINER_NAME="${1:-NodeRed}"
MODULE_PATH="/dev/buttonplus-nodered"

echo "Installing @nielseulink/node-red-contrib-buttonplus in container: ${CONTAINER_NAME}"
docker exec -it "${CONTAINER_NAME}" npm install --prefix /data --no-save "${MODULE_PATH}"
docker restart "${CONTAINER_NAME}"
echo "Done. Open Node-RED and check the Button+ palette category."
