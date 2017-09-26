import { expect } from 'chai';
import Averager from './AddAndAverage';

describe('AddAndAverage', () => {
  describe('"Basic Assumptions"', () => {
    it('should return the first value as-is', () => {
      const averager = new Averager(3);
      expect(averager.add(3)).to.equal(3);
    });
    it('"should return the mean of two values"', () => {
      const averager = new Averager(3);
      averager.add(4);
      expect(averager.add(2)).to.equal(3);
    });
    it('"should only respect the last n values"', () => {
      const averager = new Averager(3);
      averager.add(2);
      averager.add(4);
      averager.add(4);
      expect(averager.add(4)).to.equal(4);
    });
  });
});
