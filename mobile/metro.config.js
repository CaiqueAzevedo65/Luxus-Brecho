// metro.config.js (para NativeWind v2)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Se usar Reanimated, essas linhas ajudam:
config.transformer.minifierPath = 'metro-minify-terser';
config.resolver.sourceExts.push('cjs');

module.exports = config;
