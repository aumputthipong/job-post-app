// Metro config for the monorepo layout. Without this, Metro only looks in
// apps/mobile/node_modules and fails to resolve dependencies that npm
// hoisted to the workspace root (and can't see packages/shared at all).
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the whole workspace so changes in packages/shared trigger a rebuild.
config.watchFolders = [workspaceRoot];

// Resolve from the app first, then the hoisted root node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Don't walk up the directory tree beyond the paths above — avoids Metro
// silently picking up a stray node_modules from outside the workspace.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
