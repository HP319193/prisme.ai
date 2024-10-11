import fetch from 'node-fetch';
import { InvalidFile } from '../types/errors';

export async function validateUploadedFile(
  url: string,
  maxSize: number,
  mimetypePrefix: string
) {
  let response;
  try {
    response = await fetch(url, { method: 'HEAD' });
  } catch (err) {
    throw new InvalidFile('Invalid URL', { error: (err as any).message });
  }

  const contentType = response.headers.get('Content-Type');
  if (!contentType || !contentType.startsWith(mimetypePrefix)) {
    throw new InvalidFile(
      `Invalid type ${contentType}, expected a ${mimetypePrefix}.`,
      {
        maxSize,
      }
    );
  }

  const contentLength = response.headers.get('Content-Length');
  const size = parseInt(contentLength || '0');
  if (contentLength && size > maxSize) {
    throw new InvalidFile(`Too large : ${size}B exceeds limit ${maxSize}B.`, {
      maxSize,
    });
  }

  return true;
}
