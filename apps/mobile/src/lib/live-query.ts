import { type QueryKey, skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export type Subscribe<T> = (onData: (data: T) => void, onError: (error: Error) => void) => () => void;

/**
 * Keeps a Firestore listener running while the screen is mounted and writes
 * every snapshot into the query cache. Screens reading the same key share one
 * cached value, and going back to a screen shows it instantly.
 *
 * `key` must fully describe what `subscribe` listens to — it's what decides
 * when to resubscribe. Pass `subscribe: null` to wait (e.g. for an id).
 */
export function useLiveQuery<T>(key: QueryKey, subscribe: Subscribe<T> | null) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);
  const keyHash = JSON.stringify(key);
  const enabled = subscribe !== null;

  useEffect(() => {
    if (!subscribe) return;
    return subscribe(
      (data) => {
        setError(null);
        queryClient.setQueryData(key, data);
      },
      setError,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyHash stands in for key/subscribe
  }, [keyHash, enabled]);

  // Data only ever arrives through the listener above, never a fetch.
  const { data } = useQuery<T>({ queryKey: key, queryFn: skipToken });
  return { data, error, loading: enabled && data === undefined && error === null };
}
