"use client";

import { useCallback, useState } from "react";

type UseFetchReturn<TArgs extends any[], TResult> = {
  loading: boolean;
  data: TResult | null;
  error: Error | null;
  // Call the provided async function with args and store its result
  fn: (...args: TArgs) => Promise<TResult>;
  // Allow manual data updates (e.g., clearing results)
  setData: (val: TResult | null) => void;
};

// Generic client hook to wrap async/server functions
export default function useFetch<TArgs extends any[], TResult = any>(
  asyncFn: (...args: TArgs) => Promise<TResult>
): UseFetchReturn<TArgs, TResult> {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fn = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);
      try {
        const res = await asyncFn(...args);
        setData(res);
        return res as TResult;
      } catch (e: any) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { loading, data, error, fn, setData };
}
