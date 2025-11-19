#!/usr/bin/env node

const { execSync } = require("child_process");
const process = require("process");

/**
 * Publishes the VS Code extension to both vsce and ovsx
 * Passes any command line arguments to vsce, then publishes to ovsx
 */
function publishExtension() {
  try {
    // Get all command line arguments except node and script name
    const args = process.argv.slice(2);

    // Build the vsce command with arguments
    const vsceArgs = args.length > 0 ? args.join(" ") : "";
    const vsceCommand =
      `vsce publish ${vsceArgs} --allow-star-activation`.trim();

    console.log("📦 Publishing to VS Code Marketplace...");
    console.log(`Running: ${vsceCommand}`);

    // Execute vsce publish with arguments
    execSync(vsceCommand, { stdio: "inherit" });

    console.log("✅ Successfully published to VS Code Marketplace!");
    console.log("\n📦 Publishing to Open VSX Registry...");

    // Execute ovsx publish without arguments
    execSync("npx ovsx publish", { stdio: "inherit" });

    console.log("✅ Successfully published to Open VSX Registry!");
    console.log("\n🎉 Extension published to both marketplaces successfully!");
  } catch (error) {
    console.error("❌ Publishing failed:", error.message);
    process.exit(1);
  }
}

// Run the publish function if this script is executed directly
if (require.main === module) {
  publishExtension();
}

module.exports = { publishExtension };
