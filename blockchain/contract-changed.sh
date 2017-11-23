#!/bin/bash

# Convenience script for the development process
# Invokes 'truffle migrate' (compile, re-deploy) and updates a JS file with metadata

set -e
set -u

# --reset makes sure a new instance of the contract is deployed
truffle migrate --reset

node json_to_js.js build/contracts/P4PGame.json ../src/_P4PGame.js
node json_to_js.js build/contracts/P4PState.json ../src/_P4PState.js

echo "update applied"
