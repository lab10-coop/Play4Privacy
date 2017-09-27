export default class AddAndAverage {
  constructor(n) {
    this.n = n;
    this.array = [];
    this.insert_at = 0;
  }

  value() {
    return this.array.reduce((acc, next) => acc + next) / this.array.length;
  }

  add(val) {
    // Instert new value
    if (this.array.length < this.n) {
      this.array.push(val);
    } else {
      this.array[this.insert_at] = val;
    }
    // Update index for next insertion
    this.insert_at += 1;
    if ((this.insert_at % this.n) === 0) {
      this.insert_at = 0;
    }
    // Calculate average
    return this.value();
  }
}
