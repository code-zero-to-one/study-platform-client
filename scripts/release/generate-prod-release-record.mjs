#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const RELEASES_DIR = 'releases';
const getEnv = (name, fallback = '') => process.env[name]?.trim() || fallback;
const required = (name) => {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

const quote = (value) => {
  const s = String(value ?? '');
  if (s === '') return '""';
  if (/^[A-Za-z0-9_./:@+-]+$/.test(s)) return s;
  return JSON.stringify(s);
};

const parseField = (content, path) => {
  const lines = content.split(/\r?\n/);
  const stack = [];
  for (const raw of lines) {
    const match = raw.match(/^(\s*)([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const indent = match[1].length;
    const key = match[2];
    const value = match[3].trim();
    while (stack.length && stack[stack.length - 1].indent >= indent)
      stack.pop();
    stack.push({ indent, key });
    if (stack.map((item) => item.key).join('.') === path) {
      return value.replace(/^['"]|['"]$/g, '');
    }
  }
  return '';
};

const latestRelease = () => {
  if (!existsSync(RELEASES_DIR)) return null;
  const files = readdirSync(RELEASES_DIR)
    .filter((file) => /^prod-\d{8}-\d{4}\.yaml$/.test(file))
    .sort();
  if (files.length === 0) return null;
  const file = files[files.length - 1];
  const content = readFileSync(join(RELEASES_DIR, file), 'utf8');
  return { file, content };
};

const releaseId = required('RELEASE_ID');
const frontendImage = required('FRONTEND_IMAGE');
const frontendCommit = required('FRONTEND_COMMIT');
const frontendVersion = required('FRONTEND_VERSION');
const backendImage = required('BACKEND_IMAGE');
const backendCommit = required('BACKEND_COMMIT');
const backendVersion = required('BACKEND_VERSION');

const previous = latestRelease();
const rollbackFrontend =
  getEnv('ROLLBACK_FRONTEND_IMAGE') ||
  (previous ? parseField(previous.content, 'components.frontend.image') : '');
const rollbackBackend =
  getEnv('ROLLBACK_BACKEND_IMAGE') ||
  (previous ? parseField(previous.content, 'components.backend.image') : '');

if (!rollbackFrontend) {
  throw new Error(
    'ROLLBACK_FRONTEND_IMAGE is required when there is no previous release record',
  );
}
if (!rollbackBackend) {
  throw new Error(
    'ROLLBACK_BACKEND_IMAGE is required when there is no previous release record',
  );
}

const dbChanged = /^true$/i.test(getEnv('DB_CHANGED', 'false'));
const migrationVersion = getEnv('DB_MIGRATION_VERSION', 'N/A');
const migrationFiles = getEnv('DB_MIGRATION_FILES')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);
const deployedAt = required('DEPLOYED_AT');
const deployedBy = getEnv('DEPLOYED_BY', 'github-actions');
const summary = getEnv('RELEASE_SUMMARY', '프론트엔드 프로덕션 배포');
const dbRollbackNote = getEnv(
  'DB_ROLLBACK_NOTE',
  'DB 롤백은 자동화되어 있지 않습니다. 기록된 DB 상태와 앱 호환성을 확인하세요.',
);
const backendChanged = /^true$/i.test(getEnv('BACKEND_CHANGED', 'false'));
const frontendDeployId = getEnv(
  'FRONTEND_DEPLOY_ID',
  `frontend-${releaseId}-${frontendCommit}`,
);
const backendDeployId = getEnv('BACKEND_DEPLOY_ID');
const pairedBackendDeployId = getEnv('PAIRED_BACKEND_DEPLOY_ID');
const releaseIntent =
  getEnv('BACKEND_RELEASE_INTENT') || getEnv('RELEASE_TYPE');
const bootstrapMode = getEnv('BOOTSTRAP_MODE');

if (migrationVersion === 'none') {
  throw new Error(
    'DB_MIGRATION_VERSION must use N/A when there is no migration',
  );
}
if (dbChanged && migrationVersion === 'N/A') {
  throw new Error('DB_CHANGED=true requires DB_MIGRATION_VERSION');
}
if (backendChanged && !backendDeployId) {
  throw new Error('BACKEND_DEPLOY_ID is required when BACKEND_CHANGED=true');
}
if (
  backendChanged &&
  pairedBackendDeployId &&
  pairedBackendDeployId !== backendDeployId
) {
  throw new Error('PAIRED_BACKEND_DEPLOY_ID must match BACKEND_DEPLOY_ID');
}

mkdirSync(RELEASES_DIR, { recursive: true });

const migrationBlock = migrationFiles.length
  ? migrationFiles.map((file) => `    - ${quote(file)}`).join('\n')
  : '    []';

const yaml = `release_id: ${quote(releaseId)}
env: prod
service_version: ${quote(frontendVersion)}

summary: ${quote(summary)}

components:
  frontend:
    repo: study-platform-client
    image: ${quote(frontendImage)}
    commit: ${quote(frontendCommit)}
    version: ${quote(frontendVersion)}
    changed: true

  backend:
    repo: study-platform-mvp
    image: ${quote(backendImage)}
    commit: ${quote(backendCommit)}
    version: ${quote(backendVersion)}
    changed: ${backendChanged ? 'true' : 'false'}

database:
  changed: ${dbChanged ? 'true' : 'false'}
  migration_version: ${quote(migrationVersion)}
  migration_files:
${migrationBlock}

rollback:
  app_rollback_target:
    frontend: ${quote(rollbackFrontend)}
    backend: ${quote(rollbackBackend)}
  db_rollback_note: ${quote(dbRollbackNote)}

deployed_at: ${quote(deployedAt)}
deployed_by: ${quote(deployedBy)}
status: success

metadata:
  frontend_deploy_id: ${quote(frontendDeployId)}
  backend_deploy_id: ${quote(backendDeployId)}
  paired_backend_deploy_id: ${quote(pairedBackendDeployId)}
  release_intent: ${quote(releaseIntent)}
  bootstrap_mode: ${quote(bootstrapMode)}
`;

const outFile = join(RELEASES_DIR, `${releaseId}.yaml`);
if (existsSync(outFile)) {
  throw new Error(`Release record already exists: ${outFile}`);
}
writeFileSync(outFile, yaml);
process.stdout.write(`${outFile}\n`);
