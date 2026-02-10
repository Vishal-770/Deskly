const fs = require("fs");
const path = require("path");

function fixElectronImports(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixElectronImports(filePath);
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(filePath, "utf8");
      const original = content;

      // Fix the incorrect require("../electron") or require("../../electron") etc. back to require("electron")
      content = content.replace(
        /require\(["'](?:\.\.\/)+electron["']\)/g,
        'require("electron")',
      );

      if (content !== original) {
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`Fixed: ${filePath}`);
      }
    }
  });
}

const distElectronPath = path.join(__dirname, "dist-electron");
console.log("Fixing electron imports...");
fixElectronImports(distElectronPath);
console.log("Done!");
