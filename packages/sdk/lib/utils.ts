export const removedUndefinedProperties = (
  obj: any,
  removeEmptyStrings: boolean = false
) =>
  Object.entries(obj).reduce((newObject: any, [key, value]) => {
    if (value !== undefined) {
      if (!(removeEmptyStrings && value === '')) {
        newObject[key] = value;
      }
    }
    return newObject;
  }, {});

export function dataURItoBlob(dataURI: string): [Blob, string] {
  // convert base64/URLEncoded data component to raw binary data held in a string
  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1].split(';')[0]);
  else byteString = unescape(dataURI.split(',')[1]);
  // separate out the mime component
  const metadata = dataURI
    .split(';')
    .map((v) => v.split(/:/))
    .filter((pair) => pair.length === 2);
  const [, mimeString = ''] = metadata.find(([k, v]) => k === 'data') || [];
  const [, ext] = mimeString.split(/\//);
  const [, fileName = `file.${ext}`] =
    metadata.find(([k, v]) => k === 'filename') || [];

  // write the bytes of the string to a typed array
  let ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return [new Blob([ia], { type: mimeString }), fileName];
}

export function isDataURL(file: any): file is string {
  return !!(typeof file === 'string' && file.match(/^data\:/));
}
