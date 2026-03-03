import { useSearch } from '@tanstack/react-router';

export function IndexRoute() {
  const search = useSearch({ from: '/tickets/' });

  return (
    <div>
      <pre>{JSON.stringify(search, null, 2)}</pre>
    </div>
  );
}
