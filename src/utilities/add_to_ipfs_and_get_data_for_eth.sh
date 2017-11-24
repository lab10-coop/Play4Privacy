#!/bin/bash

# expects a directory containing input json files as first parameter
# and the path to an output filename (must not exist!) as second parameter

set -e
set -u

in_dir=$1
out_file=$2

if [ -f $out_file ]; then
    echo "$out_file already exists!"
    exit 1
fi

echo "[" > $out_file

for fname in $in_dir/*.json; do
    echo "processing $fname"
    hash_ipfs=$(ipfs add -Q $fname)
    hash_hex=$(npm run persist ipfs2hex $hash_ipfs | grep "result" | cut -d " " -f 2)
    echo "hex hash: $hash_hex"
    board_hex=$(npm run persist board2hex $fname | grep "result" | cut -d " " -f 2)
    echo "board hex: $board_hex"

    echo "{ \"file\": \"$fname\", \"ipfs\": \"$hash_ipfs\", \"state\": \"$hash_hex\", \"board\": \"$board_hex\" }," >> $out_file
done

# remove the last comma
sed -i '$ s/.$//' $out_file

echo "]" >> $out_file
