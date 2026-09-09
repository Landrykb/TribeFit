'use client';

import { SWRConfig } from 'swr';

async function fetcher(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error('Request failed');
    err.status = res.status;
    try {
      err.info = await res.json();
    } catch (_) {}
    throw err;
  }
  return res.json();
}

function ApiProvider({ children }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        refreshInterval: 0,
        dedupingInterval: 2000,
        errorRetryCount: 2,
        onError: (err) => {
          console.error('SWR error:', err);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}

export { fetcher, ApiProvider };
