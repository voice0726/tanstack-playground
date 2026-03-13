type QueryValue = string | number | boolean | null | undefined;

type QueryRecord = Record<string, QueryValue | QueryValue[]>;

export const toSearchParams = (query: QueryRecord) => {
  const params = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(query)) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];

    for (const value of values) {
      if (value == null || value === '') {
        continue;
      }

      params.append(key, String(value));
    }
  }

  return params;
};

export const withQuery = (path: string, query?: QueryRecord) => {
  if (!query) {
    return path;
  }

  const queryString = toSearchParams(query).toString();

  if (!queryString) {
    return path;
  }

  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${queryString}`;
};
