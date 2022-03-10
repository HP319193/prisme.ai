export const SLUG_MATCH_INVALID_CHARACTERS = new RegExp(
  '[^a-zA-Z0-9 ._-]*',
  'g'
);

export const SLUG_VALIDATION_REGEXP = new RegExp('^[a-zA-Z0-9 ._-]*$');
