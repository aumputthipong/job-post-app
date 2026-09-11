#!/usr/bin/env node
/**
 * Runs the Firebase CLI with a Java 21+ runtime.
 *
 * firebase-tools 15 refuses to start the Firestore emulator on anything older
 * than Java 21, and a machine's default `java` is often older (17 here). Rather
 * than ask everyone to swap their system JDK, this looks for a 21+ runtime —
 * JAVA_HOME first, then the JDK Android Studio bundles, which anyone building
 * this app will have installed — and puts it first on PATH for this one process.
 *
 * Usage: node scripts/firebase.mjs <firebase args...>
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const MIN_JAVA = 21;
const exe = process.platform === "win32" ? "java.exe" : "java";

function majorVersion(javaBin) {
  // `java -version` prints to stderr even on success, so both streams are read.
  const result = spawnSync(javaBin, ["-version"], { encoding: "utf8" });
  if (result.error) return 0;
  return parse(`${result.stderr ?? ""}${result.stdout ?? ""}`);
}

function parse(text) {
  const match = text.match(/version "(\d+)(?:\.(\d+))?/);
  if (!match) return 0;
  // Java 8 and earlier report "1.8.0_x".
  return match[1] === "1" ? Number(match[2]) : Number(match[1]);
}

function candidates() {
  const homes = [];
  if (process.env.JAVA_HOME) homes.push(process.env.JAVA_HOME);

  if (process.platform === "win32") {
    homes.push(
      path.join(process.env.ProgramFiles ?? "C:\\Program Files", "Android", "Android Studio", "jbr"),
    );
  } else if (process.platform === "darwin") {
    homes.push("/Applications/Android Studio.app/Contents/jbr/Contents/Home");
  } else {
    homes.push(path.join(os.homedir(), "android-studio", "jbr"), "/opt/android-studio/jbr");
  }

  return homes.map((home) => ({ home, bin: path.join(home, "bin", exe) }));
}

function findJava() {
  // Whatever is already on PATH wins if it's new enough.
  if (majorVersion("java") >= MIN_JAVA) return null;

  for (const candidate of candidates()) {
    if (existsSync(candidate.bin) && majorVersion(candidate.bin) >= MIN_JAVA) {
      return candidate.home;
    }
  }

  console.error(
    `The Firebase emulators need Java ${MIN_JAVA} or newer, and none was found.\n` +
      `Install one (e.g. \`winget install EclipseAdoptium.Temurin.21.JDK\`) or set JAVA_HOME to it.`,
  );
  process.exit(1);
}

const env = { ...process.env };
const javaHome = findJava();
if (javaHome) {
  env.JAVA_HOME = javaHome;
  env.PATH = `${path.join(javaHome, "bin")}${path.delimiter}${env.PATH}`;
}

const require = createRequire(import.meta.url);
const cli = require.resolve("firebase-tools/lib/bin/firebase.js");

const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  env,
  stdio: "inherit",
});

// Forward Ctrl+C so the emulators get a chance to shut down cleanly.
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  process.exit(signal ? 1 : (code ?? 0));
});
