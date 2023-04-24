import fs from 'fs';

const MAIN_LANGUAGE = 'fr';

const path = process.argv[2];
const languageToCheck = process.argv[3];

let errorKey = '';

function getPath(path: string, lang: string, filename: string = '') {
  return `./${path}/${lang}/${filename}`;
}

function compareKeys(a: any, b: any): boolean {
  return Object.entries(a).reduce((prev, [k, v]) => {
    const hasProperty = prev && b.hasOwnProperty(k) && typeof v !== 'object';
    if (hasProperty) {
      return true;
    }

    if (!b[k]) {
      console.error(`Key "${k}" is missing on one file`);
      return false;
    }

    return compareKeys(v, b[k]);
  }, true);
}

function compareKeys2(a: any, b: any): boolean {
  return Object.entries(a).reduce((prev, [k, v]) => {
    return (
      (prev && b.hasOwnProperty(k) && typeof v !== 'object') ||
      compareKeys(v, b[k])
    );
  }, true);
}

function check(path: string) {
  const files = fs.readdirSync(getPath(path, MAIN_LANGUAGE));
  return files.reduce((prev, file) => {
    try {
      const content = JSON.parse(
        fs.readFileSync(getPath(path, MAIN_LANGUAGE, file)).toString() || ''
      );
      const contentToCheck = JSON.parse(
        fs.readFileSync(getPath(path, languageToCheck, file)).toString() || ''
      );
      const result =
        compareKeys(content, contentToCheck) &&
        compareKeys(contentToCheck, content);

      if (!result) {
        throw new Error('');
      }
      return prev && result;
    } catch (e) {
      console.error(
        `File ${getPath(
          path,
          languageToCheck,
          file
        )} is not synced with ${MAIN_LANGUAGE}. Key ${errorKey} is missing in one file.`
      );
      if (e) {
        console.error('Additional error trace', e);
      }
      return false;
    }
  }, true);
}

const result = check(path);
if (!result) {
  process.exit(1);
}
