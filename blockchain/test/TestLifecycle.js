/* eslint-disable no-undef */
/* eslint-disable indent */
const Token = artifacts.require('PlayToken');
const Game = artifacts.require('P4PGame');
const Pool = artifacts.require('P4PPool');

const should = require('should'); // eslint-disable-line

contract('P4P Lifecycle', (accounts) => {
    console.log(`accounts: ${accounts}`);

    const token = Token.at(Token.address);
    const game = Game.at(Game.address);
    const pool = Pool.at(Pool.address);

    console.log(`
    token: ${token.address}
    game:  ${game.address}
    pool:  ${pool.address}
    `);

    const owner = accounts[0];
    const user1 = accounts[1];

    // create a random address in order to have one with 0 balance
    const randomPrivacyOrg = `0x${web3.sha3(Date.now().toString()).slice(26)}`;

    it('cannot change TokenController after locking it', async () => {
        await game.setTokenController(game.address);
        await game.lockTokenController();
        await game.setTokenController(game.address).should.be.rejected();
    });

    const games = [
        {
            hash: '0xe2782aaa1c41ebdceae2480d44f187e42844fa0247347cc267a9d9ef13223fc1',
            boardState: '0x8ef0871532bb8041d3a89faf3eccbacfa44cc5c771291ecb6fd2a36cd054649e',
            players: [ '0x4D99c88263Cd8454d911d949FeC484c7A2A68aCF' ],
            amounts: [ 4 ],
        },
        {
            hash: '0x79fd0138242bfddb57621dad2c84497f5cefe992318e44d400f847f7ce785f39',
            boardState: '0xfc96389c389faea4be295013c6d7a4bfc09e90a24ef6e754c99d6596c566c2b1',
            players: [ '0xbd9b7eE73fD2318266EB5690bC493f156d4AE5ae' ],
            amounts: [ 6 ],
        },
    ];

    it('cannot continue playing after shutdown', async () => {
        await game.addGame(games[0].hash, games[0].boardState);
        await game.distributeTokens(games[0].players, games[0].amounts);
        await game.shutdown();
        await game.addGame(games[1].hash, games[1].boardState).should.be.rejected();
        await game.distributeTokens(games[1].players, games[1].amounts).should.be.rejected();
    });

    it('donation unlock timestamp can only be advanced, not reduced', async () => {
        await pool.setDonationUnlockTs(web3.toDecimal(await pool.donationUnlockTs()) + 20);
        await pool.setDonationUnlockTs(web3.toDecimal(await pool.donationUnlockTs()) - 10).should.be.rejected();
        await pool.setDonationUnlockTs(web3.toDecimal(await pool.donationUnlockTs()) + 5);
    });

    it('only owner can advance donation unlock timestamp', async () => {
        await pool.setDonationUnlockTs(web3.toDecimal(await pool.donationUnlockTs()) + 5,
            { from: user1 }).should.be.rejected();
    });

    it('enforcement of states for donation rounds, token withdrawal and payout (including payout unlock timestamp)',
        async () => {
        await pool.setDonationReceiver(randomPrivacyOrg, { from: owner });

        // we start with state not_started
        await pool.sendTransaction({ from: user1, value: web3.toWei(0.32) }).should.be.rejected();
        await pool.payoutDonations({ from: owner }).should.be.rejected();
        await pool.withdrawTokenShare({ from: user1 }).should.be.rejected();
        // switch to donation_round1
        await pool.startNextPhase();
        await pool.sendTransaction({ from: user1, value: web3.toWei(0.32) });
        await pool.payoutDonations({ from: owner }).should.be.rejected();
        await pool.withdrawTokenShare({ from: user1 }).should.be.rejected();
        // switch to playing
        await pool.startNextPhase();
        await pool.sendTransaction({ from: user1, value: web3.toWei(0.32) }).should.be.rejected();
        await pool.payoutDonations({ from: owner }).should.be.rejected();
        await pool.withdrawTokenShare({ from: user1 }).should.be.rejected();
        // switch to donation_round2
        await pool.startNextPhase();
        await pool.sendTransaction({ from: user1, value: web3.toWei(0.32) });
        await pool.payoutDonations({ from: owner }).should.be.rejected();
        await pool.withdrawTokenShare({ from: user1 }).should.be.rejected();
        // switch to payout
        await pool.startNextPhase();
        await pool.sendTransaction({ from: user1, value: web3.toWei(0.32) }).should.be.rejected();
        // tokens can already be withdrawn
        await pool.withdrawTokenShare({ from: user1 });
        // but the donated funds are only available if the set unlock timestamp was reached
        // To test this, first make sure unlockTs lies in the future...
        const curBlockTs = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
        const unlockTs = web3.toDecimal(await pool.donationUnlockTs());
        // console.log(`curBlockTs: ${curBlockTs}, unlockTs: ${unlockTs}`);
        if (!(unlockTs > curBlockTs)) {
            console.log(`need to advance unlockTs ${curBlockTs - unlockTs} s for payout test`);
            await pool.setDonationUnlockTs(curBlockTs + 50);
        }
        await pool.payoutDonations({ from: owner }).should.be.rejected();
    });

    it('advance time and make sure payout succeeds (can be tested only on testrpc!)', async () => {
        if (web3.version.network > 4) {
            console.log('cannot run test on this network');
        } else {
            const curBlockTs = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
            const unlockTs = web3.toDecimal(await pool.donationUnlockTs());
            // console.log(`curBlockTs: ${curBlockTs}, unlockTs: ${unlockTs}`);
            // now we need to manipulate the blockchain time to advance past unlockTs.
            // Source: https://ethereum.stackexchange.com/a/21517/4298
            web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'evm_increaseTime',
                params: [ (unlockTs - curBlockTs) + 1 ],
                id: 0,
            });
            await pool.payoutDonations({ from: owner });
            // I found no way to undo this time increase :-/
        }
    });
});
