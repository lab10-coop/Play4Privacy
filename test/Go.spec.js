import { expect } from 'chai';
import gs from '../frontend/src/GameSettings';
import Go from '../src/Go';

describe('Go', () => {
  describe('"Default export should be a function"', () => {
    expect(Go).to.be.a('function');
  });
  describe('"validMove"', () => {
    it('should return false when out of bounds', () => {
      const go = new Go();
      expect(false).to.be.false;
      expect(go.validMove(-1)).to.be.false;
      expect(go.validMove(gs.BOARD_SIZE * gs.BOARD_SIZE)).to.be.false;
    });
  });
  describe('"addMove"', () => {
    it('should not allow setting an already set move', () => {
      const go = new Go();
      expect(go.addMove(0)).to.eql([]);
      expect(go.addMove(0)).to.eql(gs.ERROR_ALREADY_OCCUPIED);
      go.clearBoard();
      expect(go.fieldValue(0)).to.equal(gs.UNSET);
    });
  });
  describe('"addRandomMove"', () => {
    it('should return a valid move, until no valid move is left', () => {
      const go = new Go();
      expect(go.getRandomMove()).not.to.be.undefined;
    });
  });
});
