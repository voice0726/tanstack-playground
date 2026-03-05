export const normalizeSearchParam = (searchParam: string | string[]): string => {
  if (Array.isArray(searchParam)) {
    return searchParam[0] ?? '';
  }
  return searchParam;
};
export const normalizeSearchParam = (searchParam: string | string[]): string => {
  if (Array.isArray(searchParam)) {
    return searchParam[0] ?? '';
  }
  return searchParam;
};

export const normalizeSearchParams = (target: { [key: string]: string | string[] }) => {
  const result: { [key: string]: string } = {};

  for (const targetElement of Object.entries(target)) {
    const [key, value] = targetElement;
    result[key] = normalizeSearchParam(value);
  }
  return result;
};
