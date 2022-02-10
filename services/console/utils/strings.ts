export const truncate = (
  str: string = '',
  len: number,
  ellipsis: string = '…'
) => {
  const original = `${str || ''}`;
  const truncated = original.substring(0, len);
  return `${truncated}${original.length > truncated.length ? ellipsis : ''}`;
};
