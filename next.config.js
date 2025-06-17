/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import { PyodidePlugin } from '@pyodide/webpack-plugin';

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  webpack: (config, { isServer }) => {
    // Handle markdown and Python files
    config.module.rules.push({
      test: /\.(md|py)$/,
      use: [
        {
          loader: 'raw-loader',
          options: {
            esModule: true
          }
        }
      ]
    });

    // Handle JSON files
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });

    // // Add Pyodide webpack plugin
    // // if (!isServer) {
    //   config.plugins.push(
    //     new PyodidePlugin({
    //       // packageIndexUrl: "https://cdn.jsdelivr.net/pyodide/v0.27.6/full/",
    //       // globalLoadPyodide: true,
    //       // outDirectory: "public/pyodide"
    //     })
    //   );
    // // }

    return config;
  }
};

export default config;