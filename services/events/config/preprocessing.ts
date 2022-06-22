import path from 'path';

export const PREPROCESSING_RULES_FILEPATH =
  process.env.PREPROCESSING_RULES_FILEPATH ||
  path.resolve(__dirname, './preprocessingRules.json');
