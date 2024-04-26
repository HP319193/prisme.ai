const date = new Date(Date.now());
import fs from 'fs';

const major = Array.from(`${date.getFullYear()}`).splice(2).join('');
const minor = `${date.getMonth() + 1}`.padStart(2, '0');
const patch =
  `${date.getDate()}`.padStart(2, '0') +
  `${date.getHours()}`.padStart(2, '0') +
  `${date.getMinutes()}`.padStart(2, '0');

const version = `${major}.${minor}.${patch}`;
const pkg = JSON.parse(`${fs.readFileSync(`${__dirname}/../package.json`)}`);
pkg.version = version;
fs.writeFileSync(
  `${__dirname}/../package.json`,
  JSON.stringify(pkg, null, '  ')
);
process.stdout.write(`v${version}`);
process.exit();
