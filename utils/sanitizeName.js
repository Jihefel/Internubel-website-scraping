// Function to sanitize file or directory names
function sanitizeName(name) {
  return name.replace(/[\/\\?%*:|"<>]/g, "-");
}

module.exports = sanitizeName;