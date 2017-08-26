import { expect } from 'chai';
import findConsensus from '../src/consensus';

describe('consensus', () => {
  it('should export a function', () => {
    expect(findConsensus).to.be.a('function');
  });

  describe('"findConsensus"', () => {
    it('should return undefined if no move has been made', () => {
      const roundMoves = new Map();
      const winningMove = findConsensus(roundMoves);
      expect(winningMove.move).to.be.undefined;
      // expect(winningMove.move).to.be.at.least(0);
      // expect(winningMove.move).to.be.below(GameSettings.BOARD_SIZE * GameSettings.BOARD_SIZE);
      expect(winningMove.ids).to.have.length(0);
    });
    it('should return the move with the highest frequency', () => {
      const roundMoves = new Map();
      roundMoves.set(1, 15);
      roundMoves.set(2, 15);
      let winningMove = findConsensus(roundMoves);
      expect(winningMove.move).to.equal(15);
      expect(winningMove.ids).to.have.all.members([ 1, 2 ]);
      roundMoves.set(5, 33);
      roundMoves.set(3, 33);
      roundMoves.set(7, 33);
      winningMove = findConsensus(roundMoves);
      expect(winningMove.move).to.equal(33);
      expect(winningMove.ids).to.have.all.members([ 5, 3, 7 ]);
    });
  });
});
