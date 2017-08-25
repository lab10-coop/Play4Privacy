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
});
