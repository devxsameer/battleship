class Ship {
  constructor(shipLen) {
    if (shipLen < 1) {
      throw new Error("Ship length must be at least 1");
    }
    this.shipLen = shipLen;
    this.hits = 0;
  }
  hit() {
    this.hits++;
  }
  isSunk() {
    return this.hits >= this.shipLen;
  }
}

export default Ship;
