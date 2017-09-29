#/bin/bash

# Extracts needed info to calculate token distribution from logfiles.
# This shell script prepares the input in JSON format, then executes a node script which does further processing.

set -e
set -u

if [[ -z ${1-} || -z ${2-} ]]; then
	echo "usage: $0 <input logfile> <output directory>"
	exit 1
fi

logfile="`pwd`/$1"
dataDir=$2

pushd $dataDir

echo "checking where new games started..."
grep -n "starting new game" $logfile | cut -d ":" -f 1 > linenumbers

# add the number of the last line
cat $logfile | wc -l >> linenumbers

if [[ -z ${DEV-} ]]; then
	echo "manually remove the games running only briefly (e.g. due to server restart) from file linenumbers!"
	read -p "Press any key to open the editor..."

	vim linenumbers
fi

echo "dividing into log files per gamefile per game..."
start=1 gameId=0 && for nextStart in `cat linenumbers`; do 
	echo "game $gameId: lines ${start} to ${nextStart}"
	sed -n "${start},${nextStart}p" $logfile > game$gameId

	# filtering out moves and null addresses
	sed -i '/move [0-9]\+ valid/!d' game$gameId
#	sed -i '/new move submitted/!d' game$gameId
	sed -i '/null/d' game$gameId
	sed -i '/anonymous/d' game$gameId

	start=$nextStart
	gameId=$((gameId+1))
done
# game 0 contains the lines between log begin and first game start
rm game0

echo "converting to json..."
# delete possible remainders from previous runs
rm game*.json || true
for f in game*; do 
	echo "[ " > $f.json
#	sed 's/new move submitted: player \(.*\), move \(.*\), sig \(.*\)/{ "address": "\1", "move": \2, "sig": "\3" },/' $f >> $f.json
	sed 's/move: player \(.*\), round \(.*\), move \(.*\) valid/{ "address": "\1", "round": \2, "move": \3 },/' $f >> $f.json
	# remove the last comma
	sed -i '$ s/.$//' $f.json
	echo " ]" >> $f.json
done

echo "processing token claims"
# filter
cat $logfile | grep "claim tokens" | grep -v null | grep -v anonymous > claims
# to json
echo "[ " > claims.json
sed 's/claim tokens by \(.*\) at .* donate \(.*\)/{ "address": "\1", "donate": \2 },/' claims >> claims.json
sed -i '$ s/.$//' claims.json
echo " ]" >> claims.json

popd

echo "counting..."
node calcPayouts.js $dataDir/ $dataDir/game*.json $dataDir/claims.json 

echo "all done"

