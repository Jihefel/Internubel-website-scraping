/**
 * Extracts the sign, numeric value, and unit from a string.
 *
 * @param {string} valueStr - The string containing the value to parse.
 * @returns {{sign: string | null, amount: number, unit: string | null}} An object containing the extracted sign, amount, and unit.
 */
const extractValueAndUnit = (valueStr) => {
  // Regular expression to match optional prefix (sign), numeric value (integer or decimal), and unit
  const match = valueStr.trim().match(/^(.*?)\s*(\d+[.,]?\d*)\s*(.*)$/);
  if (match) {
    // match[1] captures the optional prefix (sign) or empty string
    // match[2] captures the numeric value, which might contain a comma or dot
    // match[3] captures the unit, which is any remaining characters after the value

    const sign = match[1] || null; // Capture the sign or null if not present
    const rawValue = match[2].replace(",", "."); // Replace commas with dots for parseFloat
    const unit = match[3].trim() || null; // Trim any surrounding whitespace from the unit
    const amount = parseFloat(rawValue);

    if (isNaN(amount)) console.error(valueStr);

    return {
      sign,
      amount: isNaN(amount) ? 0 : amount, // If parseFloat returns NaN, default to 0
      unit,
    };
  }

  return {
    sign: null,
    amount: 0,
    unit: null,
  };
};

module.exports = extractValueAndUnit;
