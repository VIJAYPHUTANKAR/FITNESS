import fs from 'fs';
import path from 'path';

describe('Feature Architecture & Public Boundary Enforcement', () => {
  const featuresDir = path.resolve(__dirname, '../features');
  const requiredFeatures = [
    'auth',
    'onboarding',
    'dashboard',
    'food-log',
    'exercise-log',
    'burn-calculator',
    'history',
    'custom-foods',
    'profile',
  ];

  test('all 9 domain features exist and have a public index.ts', () => {
    for (const feature of requiredFeatures) {
      const indexPath = path.join(featuresDir, feature, 'index.ts');
      expect(fs.existsSync(indexPath)).toBe(true);
    }
  });

  test('no file outside a feature imports private internal paths of that feature', () => {
    const srcDir = path.resolve(__dirname, '..');

    function getAllSourceFiles(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '.next') {
            files.push(...getAllSourceFiles(fullPath));
          }
        } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const allFiles = getAllSourceFiles(srcDir);
    const violations: string[] = [];

    const deepFeatureImportRegex = /from\s+['"](@\/features\/([^/'"]+)\/(components|hooks|services|types)[^'"]*)['"]/g;

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(srcDir, file).replace(/\\/g, '/');

      let match: RegExpExecArray | null;
      while ((match = deepFeatureImportRegex.exec(content)) !== null) {
        const importedFeature = match[2];
        const currentFeatureMatch = relativePath.match(/^features\/([^/]+)\//);
        const currentFeature = currentFeatureMatch ? currentFeatureMatch[1] : null;

        // If the import is coming from OUTSIDE that specific feature, it is a boundary violation
        if (currentFeature !== importedFeature) {
          violations.push(
            `${relativePath} violates boundary by importing '${match[1]}' directly. Import from '@/features/${importedFeature}' instead.`
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
