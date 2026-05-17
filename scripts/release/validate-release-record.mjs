#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const RELEASE_ID = /^prod-\d{8}-\d{4}$/;
const DATE_IN_TAG = /:.*\d{8}|:.*\d{4}-\d{2}-\d{2}/;
const POINTER_TAG = /:(prod|latest-prod)$/;
const FRONTEND_IMAGE =
  /(?:^|\/)zeroone-frontend:v\d+\.\d+\.\d+-[0-9A-Za-z]{7,}$/;
const BACKEND_IMAGE = /(?:^|\/)zeroone-backend:v\d+\.\d+\.\d+-[0-9A-Za-z]{7,}$/;
const SERVICE_VERSION = /^v\d+\.\d+\.\d+$/;
const RELEASE_INTENT = /^(patch|minor|major)$/;

const args = process.argv.slice(2);
const targets = args.length ? args : ['releases'];

const listYamlFiles = (target) => {
  if (!existsSync(target)) return [];
  if (statSync(target).isFile()) return [target];
  return readdirSync(target)
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => join(target, file));
};

const parseScalar = (content, path) => {
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

const fail = (file, message) => {
  throw new Error(`${file}: ${message}`);
};

const validateImage = (file, label, value, regex) => {
  if (!value) fail(file, `${label} is required`);
  if (POINTER_TAG.test(value))
    fail(file, `${label} must not use prod/latest-prod pointer tag`);
  if (DATE_IN_TAG.test(value))
    fail(file, `${label} tag must not contain a date`);
  if (!regex.test(value))
    fail(file, `${label} has invalid immutable tag format: ${value}`);
};

const validateFile = (file) => {
  const content = readFileSync(file, 'utf8');
  const releaseId = parseScalar(content, 'release_id');
  const expectedName = `${releaseId}.yaml`;

  if (!RELEASE_ID.test(releaseId))
    fail(file, `invalid release_id: ${releaseId}`);
  if (!file.endsWith(expectedName)) {
    fail(file, `filename must match release_id (${expectedName})`);
  }
  if (parseScalar(content, 'env') !== 'prod') fail(file, 'env must be prod');
  if (parseScalar(content, 'status') !== 'success')
    fail(file, 'status must be success');
  const serviceVersion = parseScalar(content, 'service_version');
  if (!SERVICE_VERSION.test(serviceVersion)) {
    fail(file, `service_version must be vMAJOR.MINOR.PATCH: ${serviceVersion}`);
  }

  validateImage(
    file,
    'components.frontend.image',
    parseScalar(content, 'components.frontend.image'),
    FRONTEND_IMAGE,
  );
  validateImage(
    file,
    'components.backend.image',
    parseScalar(content, 'components.backend.image'),
    BACKEND_IMAGE,
  );
  validateImage(
    file,
    'rollback.app_rollback_target.frontend',
    parseScalar(content, 'rollback.app_rollback_target.frontend'),
    FRONTEND_IMAGE,
  );
  validateImage(
    file,
    'rollback.app_rollback_target.backend',
    parseScalar(content, 'rollback.app_rollback_target.backend'),
    BACKEND_IMAGE,
  );

  const backendChanged = parseScalar(content, 'components.backend.changed');
  if (backendChanged === 'true') {
    const backendDeployId = parseScalar(content, 'metadata.backend_deploy_id');
    const releaseIntent = parseScalar(content, 'metadata.release_intent');
    const bootstrapMode = parseScalar(content, 'metadata.bootstrap_mode');
    if (!backendDeployId)
      fail(file, 'metadata.backend_deploy_id is required when backend changed');
    if (!RELEASE_INTENT.test(releaseIntent)) {
      fail(file, 'metadata.release_intent must be patch, minor, or major');
    }
    if (bootstrapMode !== 'true' && bootstrapMode !== 'false') {
      fail(
        file,
        'metadata.bootstrap_mode must be true or false when backend changed',
      );
    }
  }

  const dbChanged = parseScalar(content, 'database.changed');
  const migrationVersion = parseScalar(content, 'database.migration_version');
  if (
    dbChanged === 'true' &&
    (!migrationVersion || migrationVersion === 'none')
  ) {
    fail(file, 'database.changed=true requires database.migration_version');
  }

  for (const requiredPath of [
    'service_version',
    'components.frontend.commit',
    'components.frontend.version',
    'components.backend.commit',
    'components.backend.version',
    'rollback.db_rollback_note',
    'deployed_at',
    'deployed_by',
  ]) {
    if (!parseScalar(content, requiredPath))
      fail(file, `${requiredPath} is required`);
  }
};

const files = targets
  .flatMap(listYamlFiles)
  .filter((file) => /prod-\d{8}-\d{4}\.yaml$/.test(file));
const backendDeployIds = new Map();
for (const file of files) {
  validateFile(file);
  const content = readFileSync(file, 'utf8');
  const backendDeployId = parseScalar(content, 'metadata.backend_deploy_id');
  if (!backendDeployId) continue;
  if (backendDeployIds.has(backendDeployId)) {
    fail(
      file,
      `duplicate metadata.backend_deploy_id also recorded in ${backendDeployIds.get(backendDeployId)}`,
    );
  }
  backendDeployIds.set(backendDeployId, file);
}
process.stdout.write(`Validated ${files.length} release record(s).\n`);
