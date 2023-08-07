import stream from 'stream';
import yauzl from 'yauzl';

export async function processArchive(
  archive: Buffer,
  fileCallback: (filepath: string, stream: stream.Readable) => void
): Promise<string[]> {
  const files: string[] = [];
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(archive, { lazyEntries: true }, function (err, zipfile) {
      if (err) {
        return reject(err);
      }
      zipfile.readEntry();
      zipfile.on('end', function (entry) {
        resolve(files);
      });
      zipfile.on('entry', function (entry) {
        if (/\/$/.test(entry.fileName)) {
          // Enter in directories
          zipfile.readEntry();
        } else {
          // File
          zipfile.openReadStream(entry, async function (err, readStream) {
            if (err) {
              zipfile.close();
              return reject(err);
            }
            files.push(entry.fileName);
            await fileCallback(entry.fileName, readStream);
            zipfile.readEntry();
          });
        }
      });
    });
  });
}

export async function getArchiveEntries(archive: Buffer) {
  let entries: { filename: string; stream: stream.Readable }[] = [];
  await processArchive(archive, (filename, stream) => {
    entries.push({ filename, stream });
  });
  return entries;
}
