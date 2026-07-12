// Dynamic Expo config (replaces the old static app.json) so the SAME source
// tree can build for two hosting targets without duplicating anything:
//   - GitHub Pages, served from a subpath: https://…/sanuk-thai/
//   - Cloudflare Pages on a custom domain, served from root: https://sanukthai.com/
// BASE_PATH selects which; scripts/build-web.sh sets it per target.
// Defaults to the current live GitHub Pages subpath so plain `expo export`
// (and every existing script) keeps working unchanged.
const BASE_PATH = process.env.EXPO_PUBLIC_BASE_PATH ?? '/sanuk-thai';

module.exports = {
  expo: {
    name: 'Sanuk Thai',
    slug: 'sanuk-thai',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'sanukthai',
    userInterfaceStyle: 'dark',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#f0eee7',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.sanukthai.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#f0eee7',
      },
      package: 'com.sanukthai.app',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
      baseUrl: BASE_PATH,
    },
    plugins: ['expo-router', 'expo-font'],
    experiments: {
      typedRoutes: true,
      baseUrl: BASE_PATH,
    },
  },
};
