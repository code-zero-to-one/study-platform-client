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
const DEPLOY_ORDER = [
  'db_migration',
  'backend',
  'backend_health_check',
  'frontend',
  'e2e_check',
];
const RELEASE_ID = /^prod-\d{8}-\d{4}$/;
const VERSION = /^v\d+\.\d+\.\d+$/;
const DATE_IN_TAG = /:.*\d{8}|:.*\d{4}-\d{2}-\d{2}/;
const POINTER_TAG = /:(prod|latest-prod)$/;
const FRONTEND_IMAGE =
  /(?:^|\/)zeroone-frontend:v\d+\.\d+\.\d+-[0-9A-Za-z]{7,}$/;
const BACKEND_IMAGE = /(?:^|\/)zeroone-backend:v\d+\.\d+\.\d+-[0-9A-Za-z]{7,}$/;
const RELEASE_INTENTS = new Set(['patch', 'minor', 'major']);

const getEnv = (name, fallback = '') => process.env[name]?.trim() || fallback;

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
      return value.replace(/^["']|["']$/g, '');
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

const allReleaseFiles = () => {
  if (!existsSync(RELEASES_DIR)) return [];
  return readdirSync(RELEASES_DIR)
    .filter((file) => /^prod-\d{8}-\d{4}\.yaml$/.test(file))
    .map((file) => join(RELEASES_DIR, file));
};

const readPayload = () => {
  const raw = getEnv('BACKEND_RELEASE_PAYLOAD_JSON');
  if (!raw) throw new Error('BACKEND_RELEASE_PAYLOAD_JSON is required');
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'event_type' in parsed) {
      if (parsed.event_type !== 'backend-prod-deployed') {
        throw new Error(
          `event_type must be backend-prod-deployed: ${parsed.event_type}`,
        );
      }
      if (!parsed.client_payload || typeof parsed.client_payload !== 'object') {
        throw new Error('client_payload is required');
      }
      return parsed.client_payload;
    }
    return parsed;
  } catch (error) {
    throw new Error(`Invalid backend release payload JSON: ${error.message}`);
  }
};

const fail = (message) => {
  throw new Error(message);
};

const requireString = (value, path) => {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${path} is required`);
  }
  return value.trim();
};

const requireBoolean = (value, path) => {
  if (typeof value !== 'boolean') fail(`${path} must be boolean`);
  return value;
};

const requireArray = (value, path) => {
  if (!Array.isArray(value)) fail(`${path} must be an array`);
  return value;
};

const validateImage = ({ label, value, regex }) => {
  if (!value) fail(`${label} is required`);
  if (POINTER_TAG.test(value))
    fail(`${label} must not use prod/latest-prod pointer tag: ${value}`);
  if (DATE_IN_TAG.test(value))
    fail(`${label} tag must not contain a date: ${value}`);
  if (!regex.test(value))
    fail(`${label} has invalid immutable tag format: ${value}`);
};

const payload = readPayload();
const releaseId = requireString(payload.release_id, 'release_id');
const env = requireString(payload.env, 'env');
const backend = payload.backend ?? {};
const database = payload.database ?? {};
const rollback = payload.rollback ?? {};
const metadata = payload.metadata ?? {};
const backendDeployId = requireString(
  metadata.backend_deploy_id,
  'metadata.backend_deploy_id',
);
const releaseIntent = requireString(
  metadata.release_intent,
  'metadata.release_intent',
);
const bootstrapMode = requireBoolean(
  metadata.bootstrap_mode,
  'metadata.bootstrap_mode',
);

if (!RELEASE_ID.test(releaseId)) fail(`invalid release_id: ${releaseId}`);
if (env !== 'prod') fail('env must be prod');
if (!RELEASE_INTENTS.has(releaseIntent)) {
  fail('metadata.release_intent must be patch, minor, or major');
}

const backendRepo = requireString(backend.repo, 'backend.repo');
const backendImage = requireString(backend.image, 'backend.image');
const backendCommit = requireString(backend.commit, 'backend.commit');
const backendVersion = requireString(backend.version, 'backend.version');
const backendChanged = requireBoolean(backend.changed, 'backend.changed');
const dbChanged = requireBoolean(database.changed, 'database.changed');
const migrationVersion = requireString(
  database.migration_version,
  'database.migration_version',
);
const migrationFiles = requireArray(
  database.migration_files,
  'database.migration_files',
).map((file, index) =>
  requireString(file, `database.migration_files[${index}]`),
);
const rollbackBackend = requireString(rollback.backend, 'rollback.backend');

if (!backendChanged)
  fail('backend.changed must be true for backend-prod-deployed');
if (!VERSION.test(backendVersion))
  fail(`backend.version must be vMAJOR.MINOR.PATCH: ${backendVersion}`);
if (migrationVersion === 'none') {
  fail('database.migration_version must use N/A when there is no migration');
}
if (dbChanged && migrationVersion === 'N/A') {
  fail('database.changed=true requires database.migration_version');
}
validateImage({
  label: 'backend.image',
  value: backendImage,
  regex: BACKEND_IMAGE,
});
validateImage({
  label: 'rollback.backend',
  value: rollbackBackend,
  regex: BACKEND_IMAGE,
});

const previous = latestRelease();
if (!previous) {
  fail(
    'Backend dispatch release record requires an existing frontend release record to identify current frontend prod state.',
  );
}

const frontendImage = parseField(previous.content, 'components.frontend.image');
const frontendCommit = parseField(
  previous.content,
  'components.frontend.commit',
);
const frontendVersion = parseField(
  previous.content,
  'components.frontend.version',
);
if (!frontendImage || !frontendCommit || !frontendVersion) {
  fail(`Latest release record ${previous.file} is missing frontend prod state`);
}
validateImage({
  label: 'latest components.frontend.image',
  value: frontendImage,
  regex: FRONTEND_IMAGE,
});
if (!VERSION.test(frontendVersion)) {
  fail(
    `latest components.frontend.version must be vMAJOR.MINOR.PATCH: ${frontendVersion}`,
  );
}

for (const file of allReleaseFiles()) {
  const content = readFileSync(file, 'utf8');
  if (parseField(content, 'metadata.backend_deploy_id') === backendDeployId) {
    fail(`metadata.backend_deploy_id already recorded in ${file}`);
  }
}

const deployedAt =
  getEnv('DEPLOYED_AT') ||
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(new Date())
    .replace(' ', 'T')
    .concat('+09:00');
const deployedBy = getEnv('DEPLOYED_BY', 'automation');
const summary =
  typeof payload.summary === 'string' && payload.summary.trim()
    ? payload.summary.trim()
    : `backend ${releaseIntent} release`;
const dbRollbackNote = getEnv(
  'DB_ROLLBACK_NOTE',
  dbChanged
    ? 'Verify compatibility before app rollback if DB changed.'
    : 'DB unchanged. Use fixed app image rollback targets if needed.',
);
const pullRequestLabels = Array.isArray(metadata.pull_request_labels)
  ? metadata.pull_request_labels.map((label, index) =>
      requireString(label, `metadata.pull_request_labels[${index}]`),
    )
  : [];

mkdirSync(RELEASES_DIR, { recursive: true });

const migrationBlock = migrationFiles.length
  ? migrationFiles.map((file) => `    - ${quote(file)}`).join('\n')
  : '    []';
const pullRequestLabelsBlock = pullRequestLabels.length
  ? pullRequestLabels.map((label) => `    - ${quote(label)}`).join('\n')
  : '    []';
const previousDeployImage =
  typeof metadata.previous_deploy_image === 'string'
    ? metadata.previous_deploy_image.trim()
    : '';
if (previousDeployImage) {
  validateImage({
    label: 'metadata.previous_deploy_image',
    value: previousDeployImage,
    regex: BACKEND_IMAGE,
  });
}
const pullRequestNumber =
  typeof metadata.pull_request_number === 'number'
    ? String(metadata.pull_request_number)
    : '';

const yaml = `release_id: ${quote(releaseId)}
env: prod
service_version: ${quote(backendVersion)}

summary: ${quote(summary)}

components:
  frontend:
    repo: study-platform-client
    image: ${quote(frontendImage)}
    commit: ${quote(frontendCommit)}
    version: ${quote(frontendVersion)}
    changed: false

  backend:
    repo: ${quote(backendRepo)}
    image: ${quote(backendImage)}
    commit: ${quote(backendCommit)}
    version: ${quote(backendVersion)}
    changed: true

database:
  changed: ${dbChanged ? 'true' : 'false'}
  migration_version: ${quote(migrationVersion)}
  migration_files:
${migrationBlock}

rollback:
  app_rollback_target:
    frontend: ${quote(frontendImage)}
    backend: ${quote(rollbackBackend)}
  db_rollback_note: ${quote(dbRollbackNote)}

deploy_order:
${DEPLOY_ORDER.map((item) => `  - ${item}`).join('\n')}

deployed_at: ${quote(deployedAt)}
deployed_by: ${quote(deployedBy)}
status: success

metadata:
  backend_deploy_id: ${quote(backendDeployId)}
  release_intent: ${quote(releaseIntent)}
  bootstrap_mode: ${bootstrapMode ? 'true' : 'false'}
  previous_deploy_image: ${quote(previousDeployImage)}
  pull_request_number: ${quote(pullRequestNumber)}
  pull_request_labels:
${pullRequestLabelsBlock}
`;

const outFile = join(RELEASES_DIR, `${releaseId}.yaml`);
if (existsSync(outFile)) fail(`Release record already exists: ${outFile}`);
writeFileSync(outFile, yaml);
process.stdout.write(`${outFile}\n`);
