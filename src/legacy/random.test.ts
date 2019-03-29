import * as random from "./random";

describe("seeded random helpers", () => {
  it("should generate the same number for the same seed", () => {
    const rand1 = random.seededRandomPercentage("u123");
    const rand2 = random.seededRandomPercentage("u123");
    expect(rand1).toEqual(rand2);
  });

  it("should generate different numbers different seeds", () => {
    const rand1 = random.seededRandomPercentage("u123");
    const rand2 = random.seededRandomPercentage("u234");
    expect(rand1).not.toEqual(rand2);
  });
});
