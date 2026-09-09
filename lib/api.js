import useSWR, { mutate as globalMutate } from 'swr';
import { fetcher } from '../app/providers';

export { fetcher };

export function useApi(url, options = {}) {
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    ...options,
  });
  return { data, error, loading: isLoading, mutate };
}

export async function optimisticMutate(key, updater, promise) {
  let previous;
  await globalMutate(key, (current) => {
    previous = current;
    return updater(current);
  }, { revalidate: false });
  try {
    const result = await promise;
    globalMutate(key); // revalidate in background
    return result;
  } catch (err) {
    // Rollback to the previous cached state and revalidate to be safe
    if (previous !== undefined) {
      await globalMutate(key, previous, { revalidate: false });
    } else {
      await globalMutate(key);
    }
    throw err;
  }
}

export function keyWithId(base, id, extra = {}) {
  const params = new URLSearchParams({ ...extra });
  if (id) params.set('userId', id);
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}
