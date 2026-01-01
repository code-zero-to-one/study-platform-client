#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOOKS_QUERIES_DIR = path.join(__dirname, '..', 'src', 'hooks', 'queries');
const WATCH_MODE = process.argv.includes('--watch');
const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));

function toPascalCase(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function getApiClassName(filename) {
  const baseName = filename.replace('.ts', '');

  return toPascalCase(baseName);
}

function generateApiBoilerplate(filename) {
  const apiClassName = getApiClassName(filename);

  return `import { createApiInstance } from '@/api/client/open-api-instance';
import { ${apiClassName} } from '@/api/openapi';

const ${apiClassName.charAt(0).toLowerCase() + apiClassName.slice(1)} = createApiInstance(${apiClassName});
`;
}

function shouldProcessFile(filename) {
  if (!filename.endsWith('.ts')) return false;
  if (filename.endsWith('.d.ts')) return false;
  if (filename.endsWith('.test.ts')) return false;
  if (filename.endsWith('.spec.ts')) return false;

  return true;
}

function isFileEmpty(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8').trim();

    return content.length === 0;
  } catch (error) {
    return false;
  }
}

function hasApiBoilerplate(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    return content.includes('createApiInstance');
  } catch (error) {
    return false;
  }
}

function processFile(filePath, isNewFile = false) {
  const filename = path.basename(filePath);

  if (!shouldProcessFile(filename)) {
    return;
  }

  if (!isNewFile && !isFileEmpty(filePath)) {
    console.log(`⏭️  Skipping ${filename} (file is not empty)`);

    return;
  }

  if (hasApiBoilerplate(filePath)) {
    console.log(`⏭️  Skipping ${filename} (already has API boilerplate)`);

    return;
  }

  const boilerplate = generateApiBoilerplate(filename);

  try {
    fs.writeFileSync(filePath, boilerplate, 'utf-8');
    console.log(`✅ Generated boilerplate for ${filename}`);
  } catch (error) {
    console.error(`❌ Error writing to ${filename}:`, error.message);
  }
}

function createNewFile(filename) {
  if (!filename.endsWith('.ts')) {
    filename = `${filename}.ts`;
  }

  const filePath = path.join(HOOKS_QUERIES_DIR, filename);

  if (fs.existsSync(filePath)) {
    console.log(`⚠️  File already exists: ${filename}`);
    console.log(`   Use the existing file or delete it first.`);

    return;
  }

  const boilerplate = generateApiBoilerplate(filename);

  try {
    fs.writeFileSync(filePath, boilerplate, 'utf-8');
    console.log(`✅ Created ${filename} with boilerplate code`);
  } catch (error) {
    console.error(`❌ Error creating ${filename}:`, error.message);
  }
}

function scanExistingFiles() {
  console.log('🔍 Scanning existing files in src/hooks/queries...\n');

  try {
    const files = fs.readdirSync(HOOKS_QUERIES_DIR);

    files.forEach((file) => {
      const filePath = path.join(HOOKS_QUERIES_DIR, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        processFile(filePath);
      }
    });

    console.log('\n✨ Scan complete!\n');
  } catch (error) {
    console.error('❌ Error scanning directory:', error.message);
  }
}

function watchDirectory() {
  console.log(`👀 Watching ${HOOKS_QUERIES_DIR} for new files...\n`);

  fs.watch(HOOKS_QUERIES_DIR, { recursive: false }, (eventType, filename) => {
    if (!filename || eventType !== 'rename') return;

    const filePath = path.join(HOOKS_QUERIES_DIR, filename);

    if (!fs.existsSync(filePath)) return;

    const stats = fs.statSync(filePath);
    if (!stats.isFile()) return;

    setTimeout(() => {
      processFile(filePath);
    }, 100);
  });

  console.log('Press Ctrl+C to stop watching.\n');
}

function main() {
  console.log('🚀 API Code Generator\n');

  if (!fs.existsSync(HOOKS_QUERIES_DIR)) {
    console.error(`❌ Directory not found: ${HOOKS_QUERIES_DIR}`);
    process.exit(1);
  }

  // 파일명이 인자로 전달된 경우
  if (args.length > 0) {
    args.forEach((filename) => {
      createNewFile(filename);
    });

    return;
  }

  // 인자가 없으면 기존 동작 수행
  scanExistingFiles();

  if (WATCH_MODE) {
    watchDirectory();
  }
}

main();
