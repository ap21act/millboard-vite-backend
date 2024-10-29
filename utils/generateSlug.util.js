export const generateSlug = (inputString) => {
  if (!inputString) return '';
  return inputString
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')  // Replace spaces with dashes
    .replace(/[^a-z0-9\-]/g, '') // Remove non-alphanumeric characters except dashes
    .replace(/\//g, '_');  // Replace slashes with underscores
};
