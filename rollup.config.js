import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import nodeBuiltins from 'rollup-plugin-node-builtins';
import nodeResolve from 'rollup-plugin-node-resolve';
import cjs from 'rollup-plugin-commonjs';
import nodeGlobals from 'rollup-plugin-node-globals';
import copy from 'rollup-plugin-copy';
import historyApi from 'connect-history-api-fallback';
import browsersync from 'rollup-plugin-browsersync';

const isProduction = process.env.NODE_ENV === 'production';

const frontendConfig = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'iife',
    sourcemap: !isProduction || !!process.env.ROLLUP_WATCH
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    nodeBuiltins(),
    nodeResolve({
      browser: true,
      jsnext: true,
      customResolveOptions: {
        packageFilter: pkg => {
          if (pkg['module']) {
            pkg['main'] = pkg['module'];
          } else if (pkg['jsnext:main']) {
            pkg['main'] = pkg['jsnext:main'];
          }

          const fixedPackages = ['@firebase/util', '@firebase/database'];
          if (fixedPackages.indexOf(pkg.name) !== -1) {
            pkg['browser'] = pkg.main;
          }

          return pkg;
        },
      },
    }),
    typescript(),
    copy({
      'src/index.html': 'dist/index.html',
      'assets': 'dist',
    }),
    cjs({
      extensions: ['.js', '.ts'],
    }),
    nodeGlobals(),
    !!process.env.ROLLUP_WATCH ? browsersync({
      server: {
        baseDir: 'dist',
        middleware: [historyApi()]
      },
      open: false,
      ui: false
    }) : null,
  ].filter((plugin) => plugin !== null),
  onwarn: err => console.error(err.toString()),
  watch: {
    include: 'src/**/*'
  },
};

export default frontendConfig;
