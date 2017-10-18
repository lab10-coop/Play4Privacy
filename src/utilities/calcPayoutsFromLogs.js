/* eslint semi: ["error", "never"] */

const fs = require('fs')

const nrArgs = process.argv.length - 2
if (nrArgs <= 3 || process.argv[2] === '--help') {
  console.log(`usage: ${process.argv[1]} <output dir> <game moves file>... <claims file>`)
  process.exit(1)
}

function processMovesFile(fname) {
  // make unique
  console.log(`processing ${fname}...`)
  const objArr = JSON.parse(fs.readFileSync(fname))
  const arr = objArr.map(elem => JSON.stringify(elem))

  const uArr = [ ...new Set(arr) ]
  console.log(`removed ${objArr.length - uArr.length} of ${objArr.length} entries`)

  const moves = uArr.map(elem => JSON.parse(elem).address)
  console.log(`has ${moves.length} elements`)

  // max 30 moves per game were possible (60 overall, 30 per team and thus player)
  const maxTokPerAddr = 30
  const tokenMap = moves.reduce((map, elem) => {
    if (map.has(elem)) {
      if (map.get(elem) < maxTokPerAddr) {
        map.set(elem, map.get(elem) + 1)
      } else {
        console.log(`!!! > ${maxTokPerAddr} moves per game for ${elem} in ${fname}`)
      }
    } else {
      map.set(elem, 1)
    }
    map.delete('null')
    return map
  }, new Map())

  // console.log(`${JSON.stringify([...tokenMap])}`)
  // fs.writeFileSync(`${outDir}/.{fname}.tokenMap`, JSON.stringify(tokenMap))
  return tokenMap
}

function printMovesStats(map) {
  const tokenSum = Array.from(map).reduce((sum, elem) => sum + elem[1], 0)
  const nrRecvs = map.size
  console.log(`${nrRecvs} players earned ${tokenSum} tokens`)
}

function processMoves(movesFiles) {
  const combinedMap = new Map()
  for (const f of movesFiles) {
    console.log('')
    console.log(`processing ${f}`)
    const tokenMap = processMovesFile(f)
    printMovesStats(tokenMap)

    Array.from(tokenMap).reduce((map, elem) => {
      const addr = elem[0]
      const tokCnt = elem[1]
      if (map.has(addr)) {
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
  // const claimsArr = claims.map( elem => [elem.address, elem.donate])
  const redeems = claims.filter(elem => !elem.donate).map(elem => elem.address)
  const donations = claims.filter(elem => elem.donate).map(elem => elem.address)
  return Array.from(fullMap).reduce((res, elem) => {
    const addr = elem[0]
    redeems.indexOf(addr)
    if (redeems.indexOf(addr) !== -1) {
      if (donations.indexOf(addr) !== -1) {
        console.log(`${addr} did both redeem and donate. Redeeming all`)
      }
      res.redeem.push(elem)
    } else if (donations.indexOf(addr) !== -1) {
      res.donate.push(elem)
    } else {
      res.unclaimed.push(elem)
    }
    return res
  }, { redeem: [], donate: [], unclaimed: [] })
}

function printClaimsStats(result) {
  console.log(`${result.redeem.length} redeemed, ${result.donate.length} donateed, ${result.unclaimed.length} unclaimed`) // eslint-disable-line max-len
  const redeemed = result.redeem.map(elem => elem[1]).reduce((sum, elem) => sum + elem, 0)
  const donated = result.donate.map(elem => elem[1]).reduce((sum, elem) => sum + elem, 0)
  const unclaimed = result.unclaimed.map(elem => elem[1]).reduce((sum, elem) => sum + elem, 0)
  console.log(`tokens: ${redeemed} redeemed, ${donated} donated, ${unclaimed} unclaimed`)
}

const outDir = process.argv[2]
const movesFiles = process.argv.slice(3, process.argv.length - 1)

const fullMap = processMoves(movesFiles)
console.log('')
console.log('======== ALL GENERATED TOKENS ========')
// console.log(`${JSON.stringify([...fullMap])}`)
printMovesStats(fullMap)
console.log('')

fs.writeFileSync(`${outDir}/earned_tokens`, JSON.stringify([ ...fullMap ]))

const claimsFile = process.argv[process.argv.length - 1]
console.log(`processing claims in ${claimsFile}`)
const result = processClaims(claimsFile, fullMap)
console.log('')
console.log('======== RESULT ========')
// console.log(`${JSON.stringify(result)}`)
console.log('')
printClaimsStats(result)

fs.writeFileSync(`${outDir}/RESULT.json`, JSON.stringify(result))

console.log('find the results in file RESULT.json')
