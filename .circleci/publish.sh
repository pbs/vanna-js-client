#!/usr/bin/env bash
set -euox pipefail
IFS=$'\n\t'

PACKAGE=$(cat package.json | jq -r .name)
VERSION=$(cat package.json | jq -r .version)

if [ -z "$(npm info ${PACKAGE}@${VERSION})" ]; then
  echo "Package version doesn't exist; Publishing."
  npm publish --access public
else
  echo "Package version already exists; Skipping publish."
fi
