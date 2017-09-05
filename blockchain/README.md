# Role of the Blockchain

The Blockchain serves the following purposes in this project:  
* collect *entry fees* (probably 0.01 Eth) and distribute them to the orgs receiving the donations. (not yet sure if we really need this)
* persist the history of played games (hash representing it)
* assign GAME tokens to players

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

# Off-Topic

How long does a game run?  
If time capped: distribute token every 10 mins

# Contracts

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