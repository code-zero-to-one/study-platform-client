module.exports = {
  // 프로젝트의 최상위 ESLint 설정 파일임을 명시
  root: true,

  // 환경 설정: 브라우저 및 최신 ECMAScript 기능을 사용 가능하게 설정
  env: { browser: true, es2020: true },

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'next/core-web-vitals',
    '@rushstack/eslint-config/profile/web-app',
    '@rushstack/eslint-config/mixins/react',
    'prettier',
    'plugin:storybook/recommended',
  ],

  // TypeScript의 tsconfig.json 위치 지정
  parserOptions: { tsconfigRootDir: __dirname },

  settings: {
    react: {
      // React 버전을 수동으로 명시하여 속도 최적화 (자동 감지 시 불필요한 리소스 사용 가능)
      version: '19',
    },
  },

  // ESLint가 무시할 디렉토리 및 파일 지정
  ignorePatterns: [
    'next.config.ts',
    'dist',
    '.eslintrc.cjs',
    '.next',
    'src/api/openapi/**',
  ],

  // TypeScript용 ESLint 파서를 사용하도록 설정
  parser: '@typescript-eslint/parser',

  plugins: [
    // React Fast Refresh 관련 ESLint 플러그인 추가
    'react-refresh',

    // import 정렬 및 규칙 적용을 위한 ESLint 플러그인 추가
    'import',

    // tanstack-query 규칙 적용을 위한 ESLink 플러드인 추가
    '@tanstack/query',
  ],

  rules: {
    // RushStack의 변수 타입 정의 강제 규칙 비활성화
    '@rushstack/typedef-var': 'off',

    // 네이밍 규칙 끄기
    '@typescript-eslint/naming-convention': 'off',

    // TypeScript에서 타입 정의 강제하는 규칙 비활성화
    '@typescript-eslint/typedef': 'off',

    // 함수의 명시적 반환 타입 요구하는 규칙 비활성화
    '@typescript-eslint/explicit-function-return-type': 'off',

    // JSX 내에서 `.bind(this)` 사용을 금지하는 규칙 비활성화 (성능 문제 고려)
    'react/jsx-no-bind': 'off',

    // import 정렬 규칙 설정
    'import/order': [
      'warn',
      {
        groups: [
          ['builtin', 'external'], // 기본 모듈과 외부 패키지는 함께 정렬
          'internal', // 내부 모듈 그룹
          ['parent', 'sibling', 'index'], // 부모, 형제, 현재 디렉토리 파일 정렬
        ],
        pathGroupsExcludedImportTypes: ['builtin'], // 기본 내장 모듈을 제외
        alphabetize: { order: 'asc', caseInsensitive: true }, // 알파벳 순 정렬, 대소문자 무시
      },
    ],

    // 특정 코드 블록 사이에 줄바꿈 강제
    'padding-line-between-statements': ['error'],

    // 삼항 연산자 내에서 사용되지 않는 표현식 허용
    'no-unused-expressions': ['error', { allowTernary: true }],

    // console.log 등 디버깅 코드 커밋 방지 (warn/error는 허용)
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],

    // Next.js <Image> 대신 <img> 사용 금지 — rushstack override 방지용 명시적 error
    '@next/next/no-img-element': 'error',
  },
};
