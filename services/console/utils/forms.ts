export const isFormFieldValid = (meta: any) =>
  !!(meta.touched && (meta.error || meta.submitError));
