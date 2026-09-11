// Monorepo resolution, same as apps/mobile's — but no disableHierarchicalLookup
// here: nativewind's react-native-css-interop dep sits nested one level deep
// and needs Metro's normal upward directory walk to find it.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const nativewindDir = path.dirname(require.resolve("nativewind/package.json", { paths: [projectRoot] }));

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

const isPackage = (name, pkg) => name === pkg || name.startsWith(`${pkg}/`);
const from = (dir) => ({ originModulePath: path.join(dir, "package.json") });

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // One React / React Native per bundle. Packages hoisted to the workspace root
  // would otherwise pick up apps/mobile's React 18 / RN 0.72 from there.
  if (["react", "react-dom", "react-native"].some((pkg) => isPackage(moduleName, pkg))) {
    return context.resolveRequest({ ...context, ...from(projectRoot) }, moduleName, platform);
  }
  // One react-native-css-interop: the copy nativewind's Metro/Babel plugins use,
  // so the styles they register are the ones className lookups read.
  if (isPackage(moduleName, "react-native-css-interop")) {
    return context.resolveRequest({ ...context, ...from(nativewindDir) }, moduleName, platform);
  }
  // With package exports on, `import "@firebase/app"` gets the ESM build while
  // @firebase/auth's RN build `require`s the CJS one — two registries, so auth
  // throws "Component auth has not been registered yet".
  if (moduleName.startsWith("@firebase/")) {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: false },
      moduleName,
      platform,
    );
  }
  // packages/shared writes `./x.js` for Node ESM (the API needs it); TypeScript
  // maps that to x.ts, Metro doesn't — retry without the extension.
  if (moduleName.startsWith(".") && moduleName.endsWith(".js")) {
    try {
      return context.resolveRequest(context, moduleName, platform);
    } catch {
      return context.resolveRequest(context, moduleName.slice(0, -3), platform);
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
