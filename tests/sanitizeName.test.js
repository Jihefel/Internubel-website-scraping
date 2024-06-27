const sanitizeName = require("../utils/sanitizeName");

describe("sanitizeName function", () => {
  it("should replace special characters with hyphens", () => {
    const input = "Product / Name ? With % Special : Characters *";
    const expected = "Product - Name - With - Special - Characters -";
    expect(sanitizeName(input)).toBe(expected);
  });

  it("should not modify a name without special characters", () => {
    const input = "ProductNameWithoutSpecialCharacters";
    expect(sanitizeName(input)).toBe(input);
  });

  it("should replace multiple occurrences of special characters with hyphens", () => {
    const input = "File?With?Multiple??Special//Characters";
    const expected = "File-With-Multiple--Special--Characters";
    expect(sanitizeName(input)).toBe(expected);
  });

  it("should handle an empty string", () => {
    const input = "";
    expect(sanitizeName(input)).toBe("");
  });

  it("should handle a name with leading and trailing spaces", () => {
    const input = "  Name with spaces  ";
    const expected = "Name with spaces";
    expect(sanitizeName(input)).toBe(expected);
  });
});
