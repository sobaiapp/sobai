// scripts/patch-hermes.js
const fs = require("fs");
const path = require("path");

const podspecPath = path.join(__dirname, "../node_modules/react-native/sdks/hermes-engine/hermes-engine.podspec");

if (fs.existsSync(podspecPath)) {
  let content = fs.readFileSync(podspecPath, "utf8");

  // Remove both spec.visionos and ss.visionos lines
  const patched = content
    .replace(/^\s*spec\.visionos\.vendored_frameworks\s*=.*\n/m, "# spec.visionos.vendored_frameworks commented for EAS build compatibility\n")
    .replace(/^\s*ss\.visionos\.vendored_frameworks\s*=.*\n/m, "# ss.visionos.vendored_frameworks commented for EAS build compatibility\n");

  fs.writeFileSync(podspecPath, patched);
  console.log("✅ Hermes podspec fully patched");
} else {
  console.log("⚠️ Hermes podspec not found — skipping patch");
}
