// Function to initialise a JSON file as an empty array if it does not exist
async function initializeFile(filePath) {
  try {
    await fs.access(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(filePath, "[]");
    } else {
      throw error;
    }
  }
}

// Function for writing a product to the JSON file
async function writeProductToFile(filePath, product) {
  try {
    // Read existing data from the file
    let data = await fs.readFile(filePath, "utf8");
    let products = JSON.parse(data);
    // Add the new product to the array
    products.push(product);

    // Write the updated array to the file
    await fs.writeFile(filePath, JSON.stringify(products, null, 2));
  } catch (error) {
    throw error;
  }
}

module.exports = { initializeFile, writeProductToFile };