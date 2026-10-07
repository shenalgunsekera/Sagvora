// Bundles the real InsureSAAS frontend source against the mock Firebase layer.
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'D:/InsureSAAS/InsureSAAS/frontend';
const OUT = path.resolve('dist');
const MOCK = path.resolve('mock');

const mockFirebase = {
  name: 'mock-firebase',
  setup(b) {
    const map = { app: 'app.js', auth: 'auth.js', firestore: 'firestore.js', storage: 'storage.js' };
    b.onResolve({ filter: /^firebase\/(app|auth|firestore|storage)$/ }, (a) => ({ path: path.join(MOCK, map[a.path.split('/')[1]]) }));
    // EmailJS and IP lookup should never fire from the capture build.
    b.onResolve({ filter: /^@emailjs\/browser$/ }, () => ({ path: 'emailjs', namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default { send: async () => ({}), init(){} }; export const send = async () => ({}); export const init = () => {};', loader: 'js' }));
  },
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(SRC, 'src/index.js')],
  bundle: true,
  outdir: OUT,
  publicPath: '/',
  format: 'esm',
  splitting: true,
  minify: false,
  sourcemap: false,
  loader: { '.js': 'jsx', '.png': 'file', '.svg': 'file', '.jpg': 'file' },
  jsx: 'automatic',
  nodePaths: [path.join(SRC, 'node_modules')],
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.PUBLIC_URL': '""',
    'process.env': '{}',
  },
  plugins: [mockFirebase],
  logLevel: 'warning',
});

const html = fs.readFileSync(path.join(SRC, 'public/index.html'), 'utf8')
  .replaceAll('%PUBLIC_URL%', '')
  .replace('</head>', '<link rel="stylesheet" href="/index.css"></head>')
  .replace('</body>', '<script type="module" src="/index.js"></script></body>');
fs.writeFileSync(path.join(OUT, 'index.html'), html);
for (const f of ['favicon.png', 'logo512.png']) fs.copyFileSync(path.join(SRC, 'public', f), path.join(OUT, f));
console.log('built', OUT);
