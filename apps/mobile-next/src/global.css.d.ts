// The stylesheet NativeWind's Metro plugin (withNativeWind, see
// metro.config.js) reads at build time — imported for its side effect only,
// never for a value, so TypeScript just needs to know it's a legal import.
declare module "*.css";
