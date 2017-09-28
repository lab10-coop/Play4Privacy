# Setup

## How to run

Needs truffle and testrpc installed: `npm install -g truffle ethereumjs-testrpc`  
Start testrpc: `truffle-testrpc`  
Then, in another tab run `./contract-changed.sh` for applying changes to the contract code.

## How to test

* Start testrpc: `truffle-testrpc`
* Deploy the contracts: `truffle migrate --reset`
* Run tests: `truffle test`

Note that a node engine with async/await support is required. Tested with v8.4.0.

Tests are supposed to run on testrpc. If run on a public testnet, a lot of tests will fail because failed transactions don't trigger Promise rejections.  
Could be fixed by adding an assertion which checks for "all gas consumed".

## Mainnet

* Owner: 0xFe4E89f620a8663d03136bee040904fe3A623f5D
* Token address: 0xfB41f7b63c8e84f4BA1eCD4D393fd9daa5d14D61
* Game address: 0x78Cb0dB58721596Bc79Dc9D8d8296212D153D804, V2: 0x2A8A3008d7f2ba87fd339941E362FC9FBD9A1B57 (V1 was: 0x8d9a49dCc42E365D9Cd353b5AeF88eBe664C11a6)
* Pool address: 0x7e0C7676be340EE8eFB4321abfA4634a7Abfb92c

* Dev donation addr: 0x57f81fa922527198c9e8d4ac3a98971a8c46e7e2

In order to re-broadcast a stuck transaction with too low gasPrice, do:  
```
badTx = web3.eth.pendingTransactions[<index>]
badTx.data = badTx.input
badTx.gasPrice = <new gas price>
web3.eth.sendTransaction(badTx)
```
source: https://ethereum.stackexchange.com/questions/9374/geth-can-not-resend-transaction-transaction-not-found

### Gas

The minimal gas price required to get transactions through in few minutes recently fluctuates between 1 and 5 GWei.    
Since in general mainnet is quite saturated, this can sharply increase during e.g. ICO induced peaks.  
http://ethgasstation.info/ provides quite up to date and accurate info.

I usually don't use exact GWei numbers, but slightly more, hoping that will cheat our TXs in front of those with round GWei numbers.

## About truffle

Truffle has it peculiarities, but is quite useful.  
Migrations are still a bit of a mystery to me. There's too much magic going on which is painful to debug if not working as expected.  
For example the role of the Migrations contract is not very clear. Initially I tried to do without on mainnet, but couldn't figure out how to get contracts deployed that way. The internal logic for deploying and figuring out addresses seems to depend on the existence of a Migration contract.  
Deployment of the 3 contracts was split into 3 migration files because I couldn't get it working in one with chained promises or await/async.

On mainnet I deployed manually through truffle console after 3 failed attempts with the normal migration way.  
That's because the already deployed token contract could not be handled by the migrate command.

The manual commands were:
```
tokenAddress = "0xfb41f7b63c8e84f4ba1ecd4d393fd9daa5d14d61"
P4PGame.new(tokenAddress)
P4PPool.new(tokenAddress)
game = P4PGame.at("0x2A8A3008d7f2ba87fd339941E362FC9FBD9A1B57")
game.setPoolContract("0x7e0C7676be340EE8eFB4321abfA4634a7Abfb92c", {gas: 30000})
# failed with out of gas :-(
gameV1 = P4PGameV1.at("0x8d9a49dCc42E365D9Cd353b5AeF88eBe664C11a6")
gameV1.setTokenController("0x2A8A3008d7f2ba87fd339941E362FC9FBD9A1B57")
game.setPoolContract("0x7e0C7676be340EE8eFB4321abfA4634a7Abfb92c", {gas: 30000})
```

# Role of the Blockchain

The Blockchain serves the following purposes in this project:  
* collect *entry fees* (probably 0.01 Eth) and distribute them to the orgs receiving the donations. (not yet sure if we really need this)
* persist the history of played games (hash representing it)
* assign GAME tokens to players

## Environment

In order to keep the entry barrier low, the application need to be fully functional in a normal (not Ethereum aware) browser.  
If a "normal browser" is detected, web3 will connect to a lab10 provided node. An ad-hoc wallet is created locally. 

## Entry fees

In order to actually collect funds for the donations, Eth holders are needed.  
Users having Ether are expected to use the application in a web3 enriched environment (Mist, Chrome/Chromium with Metamask, Status.im).  
...

Challenge: how to avoid waiting for confirmations?  
How to listen for incoming transactions?  
How to determine if a transaction will go through (gas price etc.)?

## Game history

After every game played, the whole history state (for every move: who proposed what, which was selected) is reduced to a hash which is written to the Blockchain.  
Ideally, this state includes every move proposal as signed transaction.  
The raw state itself needs to be available at predefined and hash addressable location. Ideally located on a decentralized storage (IPFS or SWARM).

## Vouchers

*Normal people* don't have Ether or a web3 capable browser.  
For those we will provide voucher codes giving access to the game. Redeeming such a voucher code basically emulates the entry fee payment.  
Per voucher and wallet, only 1 game can be played (have we settled on this?).

The application will use the web3 lib to locally create a wallet and create signed transactions (game moves).  
  
After the game, the user should have the possibility to claim a GAME token and print out the (password protected) generated wallet or have it emailed to a given address.

### Voucher dashboard

|code    |times used|times remaining|state   |action button  |
| :----: |---------:| :----: |   :-------:   |
|Vouch1  |23        |enabled |enable |
|Vouch2  |455       |disabled|disable |

Optional: Timeline / Excel export

## Proof of Play

general: 80% of moves  
vouchers: + 1 selected move matching

# Contracts

(TODO: update)

## Token

Either ERC20 or [ERC223](https://github.com/ethereum/EIPs/issues/223).
* Make sure the token contract itself doesn't accept tokens
* Don't allow sending to address 0x0 (provide a burn address instead?)
* Implement withdrawTokens() like done [here](https://github.com/bancorprotocol/contracts/blob/master/solidity/contracts/TokenHolder.sol)?
* Should we implement approve() and transferFrom()? Can we avoid the approve vulnerability mentioned [here](https://drive.google.com/file/d/0ByMtMw2hul0EN3NCaVFHSFdxRzA/view)?
* Implement approveAndCall()?

## Game

The game contract has exclusive permission to mint GAME tokens.  
Should it already have minting rules hardcoded? E.g. time cap or supply cap.  
Function which "saves a game": persist hash, distribute tokens to players (input param: array of addresses). 