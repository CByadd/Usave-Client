import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, "../assets/icons");
const outputFile = path.join(__dirname, "../components/icons/index.js");

/**
 * Converts a file name like `fi-rr-shopping-cart-add.svg`
 * → `FiRrShoppingCartAddIcon`
 */
function toPascalCase(name) {
  return name
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^\d+/, "") // remove leading numbers
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

/**
 * Ensures SVG file uses currentColor for fill/stroke
 */
function fixSvgColors(filePath) {
  let data = fs.readFileSync(filePath, "utf8");

  // Only modify if not already using currentColor
  data = data
    .replace(/fill="(?!currentColor)[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="(?!currentColor)[^"]*"/g, 'stroke="currentColor"');

  fs.writeFileSync(filePath, data, "utf8");
}

const files = fs.readdirSync(iconsDir).filter((f) => f.endsWith(".svg"));

const exports = files
  .map((file) => {
    const name = path.basename(file, ".svg");
    const componentName = toPascalCase(name) + "Icon";
    const iconPath = `@/assets/icons/${file}`;

    // Update SVG color attributes
    fixSvgColors(path.join(iconsDir, file));

    return `export { default as ${componentName} } from "${iconPath}";`;
  })
  .join("\n");

fs.writeFileSync(outputFile, exports);
console.log("✅ Icons index.js generated successfully!");
