const { getDefaultConfig } = require("expo/metro-config");

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Add JSON support (Lottie, etc.)
  config.resolver.assetExts.push("json");

  // Prevent EMFILE errors on EAS
  config.maxWorkers = 1;

  return config;
})();
