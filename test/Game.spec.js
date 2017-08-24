import { expect } from 'chai';
import GameSettings from '../frontend/src/GameSettings';

describe('GameSettings', () => {
  describe('"idxToCoord"', () => {
    it('should export a function', () => {
      expect(GameSettings.idxToCoord).to.be.a('function');
    });
    it('should return the correct coordinate', () => {
      expect(GameSettings.idxToCoord(0)).to.equal('A9');

      // Should skip 'I' to jump right to 'J'
      expect(GameSettings.idxToCoord(GameSettings.BOARD_SIZE - 1)).to.equal('J9');
      expect(GameSettings.idxToCoord((GameSettings.BOARD_SIZE * GameSettings.BOARD_SIZE)
                                      - 1)).to.equal('J1');
    });
  });
});
