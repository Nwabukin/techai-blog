import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const icons = [
  {
    input: 'public/icons/icon-512x512.svg',
    output: 'public/icons/icon-512x512.png',
    size: '512:512',
  },
  {
    input: 'public/icons/icon-192x192.svg',
    output: 'public/icons/icon-192x192.png',
    size: '192:192',
  },
  {
    input: 'public/icons/badge-72x72.svg',
    output: 'public/icons/badge-72x72.png',
    size: '72:72',
  },
];

icons.forEach(({ input, output, size }) => {
  const command = `npx svgexport ${input} ${output} ${size}`;
  console.log(`Converting ${input} to ${output}...`);
  execSync(command);
  console.log('Done!');
});
