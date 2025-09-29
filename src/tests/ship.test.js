import Ship from "../modules/ship";

describe("Ship", () => {
  test("should throw error if length is less than 1", () => {
    expect(() => new Ship(0)).toThrow("Ship length must be at least 1");
  });

  test("should not be sunk until enough hits", () => {
    const ship = new Ship(4);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(false); // 2 hits out of 4 → not sunk
  });

  test("should be sunk when hits >= length", () => {
    const ship = new Ship(2);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});
