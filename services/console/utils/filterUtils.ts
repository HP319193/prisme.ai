import removeAccents from 'remove-accents';

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

export function removeEmpty<T>(v: T): v is Truthy<T> {
  return !!v;
}

export const search = (search: string) => (v: string) =>
  !search ||
  removeAccents(v.toLowerCase()).includes(removeAccents(search.toLowerCase()));
