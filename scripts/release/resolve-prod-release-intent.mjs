#!/usr/bin/env node
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const RELEASES_DIR = 'releases';
const DATE_IN_TAG = /:.*\d{8}|:.*\d{4}-\d{2}-\d{2}/;
const POINTER_TAG = /:(prod|latest-prod)$/;
const FRONTEND_IMAGE =
  /(?:^|\/)zeroone-frontend:v\d+\.\d+\.\d+-[0-9A-Za-z]{7,}$/;
const BACKEND_IMAGE = /(?:^|\/)zeroone-backend:v\d+\.\d+\.\d+-[0-9A-Za-z]{7,}$/;

const getEnv = (name, fallback = '') => process.env[name]?.trim() || fallback;
const required = (name) => {
  const value = getEnv(name);
  if (!value) throw new Error(`${name} is required`);
  return value;
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

const parseListField = (content, path) => {
  const lines = content.split(/\r?\n/);
  const stack = [];
  const values = [];
  let targetIndent = -1;

  for (const raw of lines) {
    const match = raw.match(/^(\s*)([A-Za-z0-9_]+):\s*(.*)$/);
    if (match) {
      const indent = match[1].length;
      const key = match[2];
      const value = match[3].trim();
      while (stack.length && stack[stack.length - 1].indent >= indent)
        stack.pop();
      stack.push({ indent, key });
      const currentPath = stack.map((item) => item.key).join('.');
      if (currentPath === path) {
        if (value === '[]') return [];
        targetIndent = indent;
        continue;
      }
      if (targetIndent >= 0 && indent <= targetIndent) break;
    }

    if (targetIndent < 0) continue;
    const item = raw.match(/^\s*-\s*(.+?)\s*$/);
    if (item) values.push(item[1].replace(/^["']|["']$/g, ''));
  }

  return values;
};

const releaseFiles = () => {
  if (!existsSync(RELEASES_DIR)) return [];
  return readdirSync(RELEASES_DIR)
    .filter((file) => /^prod-\d{8}-\d{4}\.yaml$/.test(file))
    .sort();
};

const latestRelease = () => {
  const files = releaseFiles();
  if (files.length === 0) return null;
  const file = files[files.length - 1];
  const content = readFileSync(join(RELEASES_DIR, file), 'utf8');
  return { file, content };
};

const releaseByBackendDeployId = (backendDeployId) => {
  if (!backendDeployId) return null;
  for (const file of releaseFiles().reverse()) {
    const content = readFileSync(join(RELEASES_DIR, file), 'utf8');
    if (parseField(content, 'metadata.backend_deploy_id') === backendDeployId) {
      return { file, content };
    }
  }
  return null;
};

const normalizeVersion = (value) => {
  const version = String(value || '').trim();
  if (!version) return '';
  return version.startsWith('v') ? version : `v${version}`;
};

const parseSemver = (value) => {
  const match = normalizeVersion(value).match(/^v(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`Invalid service version: ${value}`);
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
};

const bumpVersion = ({
  current,
  releaseType,
  explicitVersion,
  firstRelease,
}) => {
  if (explicitVersion) return normalizeVersion(explicitVersion);
  const base = parseSemver(current);
  if (firstRelease) return normalizeVersion(current);

  if (releaseType === 'major') return `v${base.major + 1}.0.0`;
  if (releaseType === 'minor') return `v${base.major}.${base.minor + 1}.0`;
  if (releaseType === 'patch')
    return `v${base.major}.${base.minor}.${base.patch + 1}`;

  throw new Error(
    `Unsupported release type: ${releaseType}. Use major, minor, or patch`,
  );
};

const parseKeyValues = (body) => {
  const values = new Map();
  for (const raw of String(body || '').split(/\r?\n/)) {
    const match = raw.match(/^\s*[-*]?\s*([A-Za-z0-9_-]+)\s*:\s*(.+?)\s*$/);
    if (!match) continue;
    values.set(match[1].toLowerCase().replaceAll('-', '_'), match[2].trim());
  }
  return values;
};

const parseReleaseTypeFromLabels = (labels) => {
  const matches = labels
    .map((label) => label.match(/^release:(major|minor|patch)$/i))
    .filter(Boolean)
    .map((match) => match[1].toLowerCase());
  if (matches.length > 1) {
    throw new Error(
      `Exactly one release intent label is allowed, but found ${matches.length}: ${matches.join(', ')}`,
    );
  }
  return matches[0] || '';
};

const validateImage = ({ label, value, regex }) => {
  if (!value) throw new Error(`${label} is required`);
  if (POINTER_TAG.test(value)) {
    throw new Error(
      `${label} must not use prod/latest-prod pointer tag: ${value}`,
    );
  }
  if (DATE_IN_TAG.test(value)) {
    throw new Error(`${label} tag must not contain a date: ${value}`);
  }
  if (!regex.test(value)) {
    throw new Error(`${label} has invalid immutable tag format: ${value}`);
  }
};

const fetchAssociatedPullRequest = async () => {
  const token = getEnv('GITHUB_TOKEN');
  const repository = getEnv('GITHUB_REPOSITORY');
  const sha = getEnv('GITHUB_SHA');
  if (!token || !repository || !sha) return null;

  const response = await fetch(
    `https://api.github.com/repos/${repository}/commits/${sha}/pulls`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'zeroone-prod-release-intent',
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch associated pull request for ${sha}: ${response.status} ${response.statusText}`,
    );
  }

  const pulls = await response.json();
  return pulls[0] ?? null;
};

const getIntent = async () => {
  const suppliedBody = getEnv('RELEASE_INTENT_BODY');
  const suppliedLabels = getEnv('RELEASE_INTENT_LABELS')
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean);

  if (suppliedBody || suppliedLabels.length > 0) {
    return {
      body: suppliedBody,
      labels: suppliedLabels,
      number: getEnv('RELEASE_INTENT_PR_NUMBER'),
      title: getEnv('RELEASE_INTENT_TITLE', 'Production release'),
      source: 'env',
    };
  }

  const pull = await fetchAssociatedPullRequest();
  if (pull) {
    return {
      body: pull.body || '',
      labels: (pull.labels || []).map((label) => label.name).filter(Boolean),
      number: String(pull.number),
      title: pull.title || 'Production release',
      source: 'pull_request',
    };
  }

  return {
    body: '',
    labels: [],
    number: '',
    title: getEnv('WORKFLOW_RELEASE_SUMMARY', 'Manual production deployment'),
    source: 'none',
  };
};

const writeOutput = (outputs) => {
  const outputPath = getEnv('GITHUB_OUTPUT');
  const lines = Object.entries(outputs).map(
    ([key, value]) => `${key}=${value ?? ''}`,
  );
  if (outputPath) appendFileSync(outputPath, `${lines.join('\n')}\n`);
  process.stdout.write(`${lines.join('\n')}\n`);
};

const previous = latestRelease();
const intent = await getIntent();
const values = parseKeyValues(intent.body);
const labelReleaseType = parseReleaseTypeFromLabels(intent.labels);
const bodyReleaseType = (
  values.get('release') ||
  values.get('release_type') ||
  ''
).toLowerCase();
const explicitVersion = normalizeVersion(
  values.get('version') || values.get('service_version') || '',
);
if (
  labelReleaseType &&
  bodyReleaseType &&
  labelReleaseType !== bodyReleaseType
) {
  throw new Error(
    `Release intent label (${labelReleaseType}) conflicts with PR body release (${bodyReleaseType}). Keep exactly one source of truth.`,
  );
}
const releaseType = labelReleaseType || bodyReleaseType;
const workflowSummary = getEnv('WORKFLOW_RELEASE_SUMMARY');

if (!explicitVersion && !releaseType) {
  if (getEnv('GITHUB_EVENT_NAME') !== 'workflow_dispatch') {
    throw new Error(
      'Production release intent is required. Add a PR label release:major, release:minor, or release:patch, or put release: patch in the PR body.',
    );
  }
}

const latestVersion = previous
  ? parseField(previous.content, 'service_version') ||
    parseField(previous.content, 'components.frontend.version')
  : '';
const firstRelease = !previous;
const bootstrapApproved = values.get('bootstrap') === 'approved';
if (!firstRelease && values.get('bootstrap')) {
  throw new Error(
    'bootstrap is only allowed for the first recorded production release',
  );
}
if (
  !firstRelease &&
  (/^true$/i.test(values.get('backend_changed') || '') ||
    /^true$/i.test(values.get('db_changed') || '') ||
    values.get('backend_image') ||
    values.get('backend_commit') ||
    values.get('backend_version'))
) {
  throw new Error(
    'Backend/DB changes must be recorded through backend-prod-deployed repository_dispatch, not the frontend deployment PR body.',
  );
}
if (firstRelease && !bootstrapApproved) {
  throw new Error(
    'No previous release record exists. Add bootstrap: approved and the required bootstrap approval metadata to the PR body.',
  );
}
if (firstRelease && !values.get('base_version') && !explicitVersion) {
  throw new Error(
    'First recorded release requires base_version or explicit version in the PR body.',
  );
}
const baseVersion = normalizeVersion(
  values.get('base_version') || latestVersion,
);
const frontendVersion = bumpVersion({
  current: baseVersion,
  releaseType: releaseType || 'patch',
  explicitVersion,
  firstRelease,
});
const shortSha = required('GITHUB_SHA').slice(0, 7);
const frontendImageRepository = required('FRONTEND_IMAGE_REPOSITORY');
const frontendImage = `${frontendImageRepository}:${frontendVersion}-${shortSha}`;
const releaseId = `prod-${new Intl.DateTimeFormat('sv-SE', {
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
  .replace(/[-: ]/g, '')
  .replace(/(\d{8})(\d{6})/, '$1-$2')}`;
const deployedAt = new Intl.DateTimeFormat('sv-SE', {
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

const pairedBackendDeployId = values.get('paired_backend_deploy_id') || '';
const pairedBackendRelease = releaseByBackendDeployId(pairedBackendDeployId);
if (pairedBackendDeployId && !pairedBackendRelease) {
  throw new Error(
    `paired_backend_deploy_id was not found in releases: ${pairedBackendDeployId}`,
  );
}
const backendSource = pairedBackendRelease || previous;
const previousBackendImage = backendSource
  ? parseField(backendSource.content, 'components.backend.image')
  : '';
const previousBackendCommit = backendSource
  ? parseField(backendSource.content, 'components.backend.commit')
  : '';
const previousBackendVersion = backendSource
  ? parseField(backendSource.content, 'components.backend.version')
  : '';
const backendImage = values.get('backend_image') || previousBackendImage;
const backendCommit = values.get('backend_commit') || previousBackendCommit;
const backendVersion = normalizeVersion(
  values.get('backend_version') || previousBackendVersion,
);
const backendDeployId = pairedBackendRelease
  ? parseField(pairedBackendRelease.content, 'metadata.backend_deploy_id')
  : '';
const bootstrapMode = pairedBackendRelease
  ? parseField(pairedBackendRelease.content, 'metadata.bootstrap_mode')
  : '';
const backendReleaseIntent = pairedBackendRelease
  ? parseField(pairedBackendRelease.content, 'metadata.release_intent')
  : '';
const backendChanged = pairedBackendRelease ? 'true' : 'false';
const rollbackFrontendImage =
  values.get('rollback_frontend_image') ||
  (previous ? parseField(previous.content, 'components.frontend.image') : '');
const rollbackBackendImage =
  values.get('rollback_backend_image') ||
  (pairedBackendRelease
    ? parseField(
        pairedBackendRelease.content,
        'rollback.app_rollback_target.backend',
      )
    : previous
      ? parseField(previous.content, 'components.backend.image')
      : '');

if (!backendImage || !backendCommit || !backendVersion) {
  throw new Error(
    'Backend image/commit/version are required in the PR body for the first recorded release. Use backend_image, backend_commit, and backend_version.',
  );
}
if (!rollbackFrontendImage || !rollbackBackendImage) {
  throw new Error(
    'Rollback frontend/backend images are required in the PR body for the first recorded release. Use rollback_frontend_image and rollback_backend_image.',
  );
}

validateImage({
  label: 'frontend_image',
  value: frontendImage,
  regex: FRONTEND_IMAGE,
});
validateImage({
  label: 'backend_image',
  value: backendImage,
  regex: BACKEND_IMAGE,
});
validateImage({
  label: 'rollback_frontend_image',
  value: rollbackFrontendImage,
  regex: FRONTEND_IMAGE,
});
validateImage({
  label: 'rollback_backend_image',
  value: rollbackBackendImage,
  regex: BACKEND_IMAGE,
});

writeOutput({
  release_id: releaseId,
  deployed_at: deployedAt,
  frontend_image: frontendImage,
  frontend_commit: shortSha,
  frontend_version: frontendVersion,
  release_summary: values.get('summary') || workflowSummary || intent.title,
  source_pr_number: intent.number,
  source_intent: intent.source,
  release_type: releaseType || 'patch',
  frontend_deploy_id: `frontend-${releaseId}-${shortSha}`,
  backend_changed: backendChanged,
  backend_deploy_id: backendDeployId,
  paired_backend_deploy_id: pairedBackendDeployId,
  backend_release_intent: backendReleaseIntent,
  bootstrap_mode: bootstrapMode,
  backend_image: backendImage,
  backend_commit: backendCommit,
  backend_version: backendVersion,
  db_changed:
    values.get('db_changed') ||
    (pairedBackendRelease
      ? parseField(pairedBackendRelease.content, 'database.changed')
      : 'false'),
  db_migration_version:
    values.get('db_migration_version') ||
    (backendSource
      ? parseField(backendSource.content, 'database.migration_version')
      : 'N/A'),
  db_migration_files:
    values.get('db_migration_files') ||
    (pairedBackendRelease
      ? parseListField(
          pairedBackendRelease.content,
          'database.migration_files',
        ).join(',')
      : ''),
  rollback_frontend_image: rollbackFrontendImage,
  rollback_backend_image: rollbackBackendImage,
  db_rollback_note:
    values.get('db_rollback_note') ||
    (previous
      ? parseField(previous.content, 'rollback.db_rollback_note')
      : '') ||
    'DB rollback is not automated. Confirm app compatibility with the recorded DB state.',
});
