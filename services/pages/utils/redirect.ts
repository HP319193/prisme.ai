export function redirect({
  slug,
  redirect: { url = '' } = {},
}: Prismeai.Page & Record<string, any>) {
  if (!url || url === slug) return;

  return {
    redirect: {
      permanent: true,
      destination: url,
    },
  };
}
