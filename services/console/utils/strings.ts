export const truncate = (str: string, len: number, ellipsis: string = '…') => {
  const truncated = str.substring(0, len);
  return `${truncated}${str.length > truncated.length ? ellipsis : ''}`;
};
