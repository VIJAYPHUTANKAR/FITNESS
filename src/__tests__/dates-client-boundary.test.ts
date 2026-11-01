import fs from 'fs';
import path from 'path';

/**
 * Static Architectural Boundary Test:
 * Ensures that `todayISO` is NEVER imported or called in server components,
 * server services, or server utilities, because server clocks (e.g., UTC on Vercel)
 * produce incorrect calendar days for users in other time zones (such as IST).
 *
 * Any source file importing `todayISO` MUST be a Client Component or Hook marked with 'use client'.
 */

function getAllFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('Dates Client-Boundary Static Audit', () => {
  const srcRoot = path.resolve(__dirname, '..');
  const allSourceFiles = getAllFiles(srcRoot);

  test('only files with "use client" directive import todayISO from date helpers', () => {
    const violations: string[] = [];

    for (const filePath of allSourceFiles) {
      // Exclude test files
      if (filePath.includes('__tests__') || filePath.endsWith('.test.ts') || filePath.endsWith('.test.tsx')) {
        continue;
      }

      // Exclude the date module definition itself
      const normalizedPath = filePath.replace(/\\/g, '/');
      if (normalizedPath.endsWith('src/lib/dates/index.ts')) {
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf-8');

      // Check if file imports todayISO
      const importsTodayISO = /import\s+[^;]*\btodayISO\b[^;]*from\s+['"][^'"]+['"]/.test(content);

      if (importsTodayISO) {
        // Must contain 'use client' directive
        const hasUseClient = /^\s*(['"])use client\1/m.test(content);
        if (!hasUseClient) {
          violations.push(filePath);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  test('server services and route files do not import todayISO', () => {
    const serverFilesToCheck = allSourceFiles.filter((filePath) => {
      const norm = filePath.replace(/\\/g, '/');
      return (
        norm.includes('/services/') ||
        norm.includes('/app/') ||
        norm.includes('/lib/supabase/server')
      );
    });

    const violations: string[] = [];
    for (const filePath of serverFilesToCheck) {
      if (filePath.includes('__tests__')) continue;
      const content = fs.readFileSync(filePath, 'utf-8');
      if (/import\s+[^;]*\btodayISO\b[^;]*from\s+['"][^'"]+['"]/.test(content)) {
        violations.push(filePath);
      }
    }

    expect(violations).toEqual([]);
  });
});
