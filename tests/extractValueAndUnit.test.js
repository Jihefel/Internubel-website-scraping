const extractValueAndUnit = require("../utils/extractValueAndUnit"); // Adjust the path as per your file structure

describe("extractValueAndUnit", () => {
  it("should extract value and unit correctly without sign", () => {
    const result = extractValueAndUnit("30.2 g");
    expect(result).toEqual({ sign: null, amount: 30.2, unit: "g" });
  });

  it("should extract value and unit correctly with sign", () => {
    const result = extractValueAndUnit("< 0.07 g");
    expect(result).toEqual({ sign: "<", amount: 0.07, unit: "g" });
  });

  it("should handle empty input", () => {
    const result = extractValueAndUnit("");
    expect(result).toEqual({ sign: null, amount: 0, unit: null });
  });

  it("should handle input with no numeric value", () => {
    const result = extractValueAndUnit("No value");
    expect(result).toEqual({ sign: null, amount: 0, unit: null });
  });

  it("should handle input with complex unit", () => {
    const result = extractValueAndUnit("123.45 ml (milliliters)");
    expect(result).toEqual({ sign: null, amount: 123.45, unit: "ml (milliliters)" });
  });

  it("should handle input with multiple spaces", () => {
    const result = extractValueAndUnit("   50,5   g   ");
    expect(result).toEqual({ sign: null, amount: 50.5, unit: "g" });
  });

  it("should handle input with no spaces", () => {
    const result = extractValueAndUnit("14.5g");
    expect(result).toEqual({ sign: null, amount: 14.5, unit: "g" });
    const result2 = extractValueAndUnit("<11,3g");
    expect(result2).toEqual({ sign: "<", amount: 11.3, unit: "g" });
  });

  it("should handle input with comma as decimal separator", () => {
    const result = extractValueAndUnit("15,7 g");
    expect(result).toEqual({ sign: null, amount: 15.7, unit: "g" });
  });

  it("should handle input with dot as decimal separator", () => {
    const result = extractValueAndUnit("2.5 ml");
    expect(result).toEqual({ sign: null, amount: 2.5, unit: "ml" });
  });

  it("should handle input with unusual sign characters", () => {
    const result = extractValueAndUnit("~0.3 oz");
    expect(result).toEqual({ sign: "~", amount: 0.3, unit: "oz" });
    const result2 = extractValueAndUnit("approx. 12,5 g");
    expect(result2).toEqual({ sign: "approx.", amount: 12.5, unit: "g" });
  });

  it("should handle input with no unit", () => {
    const result = extractValueAndUnit("3");
    expect(result).toEqual({ sign: null, amount: 3, unit: null });
  });

  it("should default to 0 amount if value cannot be parsed", () => {
    const result = extractValueAndUnit("< deux g");
    expect(result).toEqual({ sign: null, amount: 0, unit: null });
  });
});
