import { expect } from 'chai';
import add from '../src/add';

describe('Add', () => {
  describe('"add"', () => {
    it('should export a function', () => {
      expect(add).to.be.a('function');
    });
    it('should return the correct values', () => {
      expect(add(2, 2)).to.equal(4);
      expect(add(2, 3)).to.equal(5);
      expect(add(0, 2)).to.equal(2);
      expect(add(2, 0)).to.equal(2);
      expect(add(-3, 2)).to.equal(-1);
    });
  });
});
