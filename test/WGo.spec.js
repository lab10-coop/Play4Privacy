import { expect } from 'chai';
import gs from '../frontend/src/GameSettings';
import WGo from '../src/wgo';

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
      const wgo = new WGo(gs.BOARD_SIZE, 'NONE');
      wgo.play(0, 0);
    });
  });
  describe('"addMove"', () => {
    it('adding the same move twice should fail', () => {
      const wgo = new WGo(gs.BOARD_SIZE, 'NONE');
      wgo.play(0, 0);
      expect(wgo.play(0, 0)).to.equal(2);
    });
  });
  describe('"Extract data needed for p4p"', () => {
    it('should allow extraction of an array of all fields', () => {
      const wgo = new WGo(gs.BOARD_SIZE, 'NONE');
      wgo.play(0, 0);
      wgo.play(3, 2);

      // wgo.position.schema holds the raw array of positions
      const schema = wgo.getPosition().schema;
      expect(schema[0]).to.equal(1);

      // x is the vertical axis!!
      const idx = 2 + (3 * gs.BOARD_SIZE);
      expect(schema[idx]).to.equal(-1);

      // Convert from index to coordinates
      const x = Math.floor(idx / gs.BOARD_SIZE);
      const y = Math.floor(idx % gs.BOARD_SIZE);
      expect(wgo.position.get(x, y)).to.equal(-1);

      const forFrontend = schema.map((value) => {
        if (value === -1) {
          return 'WHITE';
        } else if (value === 1) {
          return 'BLACK';
        }
        return '';
      });

      expect(forFrontend[idx]).to.equal('WHITE');
    });
    it('should give the active team color', () => {
      const wgo = new WGo(gs.BOARD_SIZE, 'NONE');
      expect(wgo.turn).to.equal(1);
      wgo.play(0, 0);
      expect(wgo.turn).to.equal(-1);
      wgo.play(3, 2);
    });
    it('should provide a function to check move validity, without setting the move', () => {
      const wgo = new WGo(gs.BOARD_SIZE, 'NONE');
      expect(wgo.isValid(0, 0)).to.be.true;
      expect(wgo.getStone(0, 0)).to.equal(0);
      wgo.play(0, 0);
      expect(wgo.isValid(0, 0)).to.be.false;
    });
    it('should allow to start a new game, without adding a new game to the stack', () => {
      const wgo = new WGo(gs.BOARD_SIZE, 'NONE');
      expect(wgo.stack.length).to.equal(1);
      wgo.play(3, 2);
      expect(wgo.getStone(3, 2)).to.equal(1);
      wgo.firstPosition();
      expect(wgo.getStone(3, 2)).to.equal(0);
      expect(wgo.stack.length).to.equal(1);
    });
  });
});
