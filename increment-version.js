import fs from 'fs';

try {
  // Read package.json
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

  // Parse version
  const versionParts = pkg.version.split('.').map(Number);
  if (versionParts.length === 3 && !versionParts.some(isNaN)) {
    versionParts[2] += 1;
    pkg.version = versionParts.join('.');
  } else {
    pkg.version = '1.1.0';
  }

  // Write back to package.json
  fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');

  // Write to src/version.ts
  fs.writeFileSync('./src/version.ts', `export const VERSION = '${pkg.version}';\n`);

  console.log(`Successfully incremented version to ${pkg.version}`);
} catch (error) {
  console.error('Error running increment-version.js:', error);
  process.exit(1);
}
