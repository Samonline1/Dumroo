import fs from "fs";
import path from "path";

export function loadEnvFiles() {
  const envLocal = path.resolve(process.cwd(), ".env.local");
  const env = path.resolve(process.cwd(), ".env");

  if (fs.existsSync(env)) {
    try {
      if (typeof process.loadEnvFile === "function") {
        process.loadEnvFile(env);
      }
    } catch {}
  }

  // Override with local
  if (fs.existsSync(envLocal)) {
    try {
      if (typeof process.loadEnvFile === "function") {
        process.loadEnvFile(envLocal);
      }
    } catch {}
  }
}

loadEnvFiles();
