import type { StorybookConfig } from '@storybook/nextjs-vite';
import svgr from 'vite-plugin-svgr';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  viteFinal: (config) => {
    // SVGR plugin이 Storybook 내 Vite 번들링에 사용되도록 추가
    config.plugins = [...(config.plugins || []), svgr({ include: /\.svg$/ })];

    // nextjs-vite 내에서 SVGR 이 작동하도록 plugin 동작 수정
    // 출처: https://github.com/ygkn/storybook-nextjs-vite-svgr/blob/main/.storybook/main.ts
    config.plugins = config.plugins!.flat().map((plugin) => {
      if (
        typeof plugin === 'object' &&
        plugin !== null &&
        'name' in plugin &&
        plugin.name === 'vite-plugin-storybook-nextjs-image'
      ) {
        return {
          ...plugin,
          resolveId(id, importer) {
            if (id.endsWith('.svg')) {
              return null;
            }

            // @ts-expect-error `resolveId` hook of vite-plugin-storybook-nextjs-image is a function
            return plugin.resolveId(id, importer);
          },
        };
      }
      return plugin;
    });

    config.plugins = [...config.plugins];

    return config;
  },
};
export default config;
