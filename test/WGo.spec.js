import { expect } from 'chai';
import gs from '../frontend/src/GameSettings';
import WGo from '../src/wgo/wgo';

describe('WGo', () => {
  describe('"Default export should be a function"', () => {
    expect(WGo).to.be.a('function');
  });
  describe('"construct"', () => {
    it('construct without compile errors', () => {
      const wgo = new WGo();
      wgo.play(0, 0);
    });
    it('test essentials with given GameSettings', () => {
      const wgo = new WGo(gs.BOARD_SIZE, "NONE");
      wgo.play(0, 0);
    });
  });
  describe('"addMove"', () => {
    it('adding the same move twice should fail', () => {
      const wgo = new WGo(gs.BOARD_SIZE, "NONE");
      wgo.play(0, 0);
      expect(wgo.play(0, 0)).to.equal(2);
    });
  });
});
