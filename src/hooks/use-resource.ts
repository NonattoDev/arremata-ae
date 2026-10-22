"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";
export function useResource<T>(url: string | null, poll = false) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState("");
  const revision = useRef(0),
    loading = useRef(false);
  const refresh = useCallback(async () => {
    if (!url) return;
    const current = ++revision.current;
    loading.current = true;
    try {
      const next = await api<T>(url);
      if (current === revision.current) {
        setData(next);
        setError("");
      }
    } catch (e) {
      if (current === revision.current) setError((e as Error).message);
    } finally {
      if (current === revision.current) loading.current = false;
    }
  }, [url]);
  useEffect(() => {
    setData(null);
    setError("");
    void refresh();
    const timer = poll
      ? setInterval(() => {
          if (!document.hidden && !loading.current) void refresh();
        }, 2000)
      : undefined;
    return () => {
      revision.current++;
      loading.current = false;
      clearInterval(timer);
    };
  }, [refresh, poll]);
  return { data, error, refresh };
}
