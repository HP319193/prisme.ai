import stream from 'stream';
import yauzl from 'yauzl';
import unzipper from 'unzipper';

export async function processArchive(
  archive: Buffer | stream.Readable,
  fileCallback: (filepath: string, stream: stream.Readable) => void
): Promise<string[]> {
  if (archive instanceof Buffer) {
    return await processArchiveFromBuffer(archive, fileCallback);
  }

  const zipParser = unzipper.Parse({ forceStream: true });
  archive.pipe(zipParser);
  const files: string[] = [];
  for await (const entry of zipParser) {
    if (entry.type === 'File') {
      files.push(entry.path);
      fileCallback(entry.path, entry);
    } else {
      entry.autodrain();
    }
  }
  return files;
}

export async function processArchiveFromBuffer(
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
            if (!entry.fileName.startsWith('__MACOSX/')) {
              files.push(entry.fileName);
              await fileCallback(entry.fileName, readStream);
            }
            zipfile.readEntry();
          });
        }
      });
    });
  });
}

export async function getArchiveEntries(archive: Buffer | stream.Readable) {
  let entries: { filename: string; stream: stream.Readable }[] = [];
  await processArchive(archive, (filename, stream) => {
    entries.push({ filename, stream });
  });
  return entries;
}
