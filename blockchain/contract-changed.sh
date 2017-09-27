#!/bin/bash

# Invokes 'truffle migrate' (compile, re-deploy) and updates a JS file with metadata

set -e
set -u

# --reset makes sure a new instance of the contract is deployed
truffle migrate --reset

node json_to_js.js build/contracts/P4PGame.json ../src/_P4PContract.js

echo "update applied"
