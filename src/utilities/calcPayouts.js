var fs = require('fs')

nrArgs = process.argv.length - 2
if(nrArgs <= 3 || process.argv[2] == "--help") {
	console.log(`usage: ${process.argv[1]} <output dir> <game moves file>... <claims file>`)
	process.exit(1)
}

function processMovesFile(fname) {
	// make unique
	console.log(`processing ${fname}...`)
	objArr = JSON.parse(fs.readFileSync(fname))
	arr = objArr.map( elem => JSON.stringify(elem) )

	uArr = [...new Set(arr)];
	console.log(`removed ${objArr.length - uArr.length} of ${objArr.length} entries`)

	moves = uArr.map( elem => JSON.parse(elem).address)
	console.log(`has ${moves.length} elements`)

	// max 30 moves per game were possible (60 overall, 30 per team and thus player)
	const maxTokPerAddr = 30;
	tokenMap = moves.reduce( (map, elem) => {
		if(map.has(elem)) {
			if(map.get(elem) < maxTokPerAddr) {
				map.set(elem, map.get(elem)+1)
			} else {
				console.log(`!!! > ${maxTokPerAddr} moves per game for ${elem} in ${fname}`)
			}
		} else {
			map.set(elem, 1)
		}
		map.delete("null")
		return map
	}, new Map())

//	console.log(`${JSON.stringify([...tokenMap])}`)
//	fs.writeFileSync(`${outDir}/.{fname}.tokenMap`, JSON.stringify(tokenMap))
	return tokenMap
}

function printMovesStats(map) {
	tokenSum = Array.from(map).reduce( (sum, elem) => {
		return sum + elem[1]
	}, 0)
	nrRecvs = map.size
	console.log(`${nrRecvs} players earned ${tokenSum} tokens`)
}

function processMoves(movesFiles) {
	let combinedMap = new Map()
	for (let f of movesFiles) {
		console.log("")
		console.log(`processing ${f}`)
		const tokenMap = processMovesFile(f)
		printMovesStats(tokenMap)

		fullMap = Array.from(tokenMap).reduce( (map, elem) => {
			const addr = elem[0]
			const tokCnt = elem[1]
			if(map.has(addr)) {
				map.set(addr, map.get(addr) + tokCnt)
			} else {
				map.set(addr, tokCnt)
			}
			return map
		}, combinedMap)
	}
	return combinedMap
}

function processClaims(fname, fullMap) {
	const claims = JSON.parse(fs.readFileSync(fname))
//	const claimsArr = claims.map( elem => [elem.address, elem.donate])
	const redeems = claims.filter(elem => ! elem.donate).map(elem => elem.address)
	const donations = claims.filter(elem => elem.donate).map(elem => elem.address)
	return Array.from(fullMap).reduce( (res, elem) => {
		const addr = elem[0]
		const redeemId = redeems.indexOf(addr)
		if(redeems.indexOf(addr) != -1) {
			if(donations.indexOf(addr) != -1) {
				console.log(`${addr} did both redeem and donate. Redeeming all`)
			}
			res.redeem.push(elem)
		} else if(donations.indexOf(addr) != -1) {
			res.donate.push(elem)
		} else {
			res.unclaimed.push(elem)
		}
		return res
	}, { redeem: [], donate: [], unclaimed: [] })
}

function printClaimsStats(result) {
	const nrRedeem = result.redeem.length
	console.log(`${result.redeem.length} did redeem, ${result.donate.length} did donate, ${result.unclaimed.length} didn't claim`)
	const redeemed = result.redeem.map(elem => elem[1]).reduce( (sum, elem) => sum + elem, 0)
	const donated = result.donate.map(elem => elem[1]).reduce( (sum, elem) => sum + elem, 0)
	const unclaimed = result.unclaimed.map(elem => elem[1]).reduce( (sum, elem) => sum + elem, 0)
	console.log(`tokens: ${redeemed} redeemed, ${donated} donated, ${unclaimed} unclaimed`)
}

outDir = process.argv[2]
movesFiles = process.argv.slice(3, process.argv.length-1)

fullMap = processMoves(movesFiles)
console.log("")
console.log("======== ALL GENERATED TOKENS ========")
//console.log(`${JSON.stringify([...fullMap])}`)
printMovesStats(fullMap)
console.log("")

fs.writeFileSync(`${outDir}/earned_tokens`, JSON.stringify([...fullMap]))

claimsFile = process.argv[process.argv.length-1]
console.log(`processing claims in ${claimsFile}`)
result = processClaims(claimsFile, fullMap)
console.log("")
console.log("======== RESULT ========")
//console.log(`${JSON.stringify(result)}`)
console.log("")
printClaimsStats(result)

fs.writeFileSync(`${outDir}/RESULT.json`, JSON.stringify(result))

console.log(`find the results in file RESULT.json`)
