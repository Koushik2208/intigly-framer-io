const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Get Expo's default Metro config
const defaultConfig = getDefaultConfig(__dirname);

// Wrap with NativeWind, passing the input CSS
const config = withNativeWind(defaultConfig, {
  input: "./global.css",
});

// Export the merged config
module.exports = config;
