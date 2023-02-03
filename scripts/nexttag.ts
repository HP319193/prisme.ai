const date = new Date(Date.now());

const major = Array.from(`${date.getFullYear()}`).splice(2).join('');
const minor = `${date.getMonth() + 1}`.padStart(2, '0');
const patch =
  `${date.getDate()}`.padStart(2, '0') +
  `${date.getHours()}`.padStart(2, '0') +
  `${date.getMinutes()}`.padStart(2, '0');

process.stdout.write(`${major}.${minor}.${patch}
`);
process.exit();
