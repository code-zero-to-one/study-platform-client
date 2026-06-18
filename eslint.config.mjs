// ESLint v9 flat config.
// Migrated from the legacy .eslintrc.cjs to support eslint-config-next@16,
// which ships a flat config and is incompatible with the eslintrc format.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import rushstackReact from '@rushstack/eslint-config/flat/mixins/react.js';
import rushstackWebApp from '@rushstack/eslint-config/flat/profile/web-app.js';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// eslint-config-next/typescript 와 @rushstack/eslint-config 가 모두
// `@typescript-eslint` 플러그인과 TS 파서를 정의한다. flat config 에서는
// 같은 파일에 매칭되는 두 설정이 동일 플러그인 키를 중복 정의하면
// "Cannot redefine plugin" 에러가 난다.
// 해결: next/typescript 가 `@typescript-eslint` 플러그인/파서의 단일 출처가 되도록
// 두고, rushstack 설정 블록에서는 해당 플러그인 키와 parser 만 제거한다
// (rushstack 고유 플러그인/규칙은 유지).
const stripTypescriptEslintPlugin = (configs) =>
  configs.map((entry) => {
    if (!entry || typeof entry !== 'object') return entry;
    const next = { ...entry };

    if (next.plugins && next.plugins['@typescript-eslint']) {
      const { '@typescript-eslint': _omit, ...restPlugins } = next.plugins;
      next.plugins = restPlugins;
    }

    if (next.languageOptions) {
      const {
        parser: _omitParser,
        parserOptions,
        ...restLangOpts
      } = next.languageOptions;
      next.languageOptions = restLangOpts;

      // rushstack 의 parserOptions.project(타입 인식) 설정도 제거한다.
      // 타입 인식 파싱은 아래 projectService 블록에서 일괄 적용한다.
      if (parserOptions) {
        const { project: _omitProject, ...restParserOptions } = parserOptions;
        if (Object.keys(restParserOptions).length > 0) {
          next.languageOptions.parserOptions = restParserOptions;
        }
      }
    }

    return next;
  });

const config = [
  // 무시할 디렉토리 및 파일 (구 ignorePatterns + .next 등)
  {
    ignores: [
      'next.config.ts',
      'dist/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'src/api/openapi/**',
      'public/mockServiceWorker.js',
      'eslint.config.mjs',
    ],
  },

  // eslint:recommended
  js.configs.recommended,

  // next/core-web-vitals: react, react-hooks, import, jsx-a11y, @next/next 포함
  ...nextCoreWebVitals,

  // @typescript-eslint/recommended (next/typescript export)
  // `@typescript-eslint` 플러그인 + TS 파서의 단일 출처.
  ...nextTypescript,

  // @tanstack/eslint-plugin-query/recommended (flat)
  ...tanstackQuery.configs['flat/recommended'],

  // @rushstack/eslint-config/profile/web-app — 중복되는 `@typescript-eslint`
  // 플러그인/파서는 제거하고 rushstack 고유 규칙만 적용.
  ...stripTypescriptEslintPlugin(rushstackWebApp),
  // @rushstack/eslint-config/mixins/react (profile 다음에 와야 함)
  ...stripTypescriptEslintPlugin(rushstackReact),

  // type-aware parser 설정: rushstack 규칙 중 일부는 타입 정보를 요구한다.
  // 구 .eslintrc.cjs 는 project:'./tsconfig.json' 를 썼으나, .storybook/* 처럼
  // tsconfig include 글롭(`**/*`)이 dot-디렉터리를 잡지 못해 프로젝트 밖인
  // 파일은 parse 에러가 난다. typescript-eslint 의 projectService 를 사용하면
  // 프로젝트 밖 파일도 default project 로 처리되어 안정적이다.
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: {
          // tsconfig include 글롭(`**/*`)이 dot-디렉터리(.storybook)를 잡지 못해
          // 프로젝트 밖인 설정성 파일은 default project 로 파싱하도록 허용한다.
          allowDefaultProject: ['.storybook/*.ts', '.storybook/*.tsx'],
        },
        tsconfigRootDir: __dirname,
      },
    },
  },

  // storybook/recommended (flat) — 배열 형태
  ...storybook.configs['flat/recommended'],

  // eslint-plugin-storybook@10 의 recommended 는 `storybook/no-renderer-packages`
  // 를 error 로 켠다. 그러나 SB10 의 framework 패키지(@storybook/nextjs-vite)는
  // config 헬퍼만 re-export 할 뿐 `Meta`/`StoryObj` 타입은 노출하지 않으므로,
  // 스토리의 타입 import 출처는 여전히 renderer 패키지(@storybook/react)여야 한다.
  // 타입 import 를 깨뜨리지 않도록 스토리 파일에 한해 이 규칙만 끈다.
  {
    files: ['**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    rules: {
      'storybook/no-renderer-packages': 'off',
    },
  },

  // prettier 와 충돌하는 스타일 규칙 비활성화 (커스텀 규칙보다 앞에 위치)
  prettier,

  // react-refresh 플러그인 (구 plugins: ['react-refresh'])
  reactRefresh.configs.recommended,

  // 프로젝트 커스텀 규칙 (구 .eslintrc.cjs rules)
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    settings: {
      react: {
        // React 버전을 수동으로 명시하여 속도 최적화
        version: '19',
      },
    },
    rules: {
      // RushStack 의 변수 타입 정의 강제 규칙 비활성화
      '@rushstack/typedef-var': 'off',

      // 네이밍 규칙 끄기
      '@typescript-eslint/naming-convention': 'off',

      // TypeScript 타입 정의 강제 규칙 비활성화
      '@typescript-eslint/typedef': 'off',

      // 함수의 명시적 반환 타입 요구 규칙 비활성화
      '@typescript-eslint/explicit-function-return-type': 'off',

      // JSX 내 `.bind(this)` 금지 규칙 비활성화 (성능 고려)
      'react/jsx-no-bind': 'off',

      // import 정렬 규칙
      'import/order': [
        'warn',
        {
          groups: [
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // 특정 코드 블록 사이 줄바꿈 강제
      'padding-line-between-statements': ['error'],

      // 삼항 연산자 내 미사용 표현식 허용
      'no-unused-expressions': ['error', { allowTernary: true }],

      // console.log 등 디버깅 코드 커밋 방지 (warn/error/info 허용)
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],

      // Next.js <Image> 대신 <img> 사용 금지 — rushstack override 방지용 명시적 error
      '@next/next/no-img-element': 'error',

      // --- 버전 업(eslint-config-next@16) 으로 새로 도입된 규칙 완화 ---
      // next@16 은 eslint-plugin-react-hooks@7 을 번들한다. 7 의 recommended 는
      // React Compiler 기반의 신규 규칙(set-state-in-effect / refs /
      // preserve-manual-memoization / purity / incompatible-library)을 error 로
      // 켜는데, 기존 코드베이스는 이 규칙들을 한 번도 적용받은 적이 없다.
      // 마이그레이션 phase 에서 200+ 건을 일괄 수정하는 것은 범위를 벗어나고
      // 위험하므로, 규칙을 끄지 않고 warn 으로 강등해 가시성은 유지한다.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/incompatible-library': 'warn',

      // react-refresh/recommended 가 error 로 켜지만, 구 .eslintrc.cjs 는
      // react-refresh 를 plugin 으로만 등록하고 규칙은 활성화하지 않았다.
      // 기존 동작(비차단)과 맞추되 가시성 유지를 위해 warn 으로 강등.
      'react-refresh/only-export-components': 'warn',
    },
  },

  // 빌드/코드젠 스크립트: 구 lint 는 `--ext ts,tsx` 라 .mjs 스크립트를 검사하지
  // 않았다. CLI 스크립트에서의 console 출력은 정상 동작이므로 허용한다.
  {
    files: ['scripts/**/*.{js,mjs,cjs}'],
    rules: {
      'no-console': 'off',
    },
  },
];

export default config;
