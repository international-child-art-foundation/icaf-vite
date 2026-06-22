import { useEffect, useState } from 'react';

const STORAGE_KEY = 'icaf:animation-performance:v1';
const SAMPLE_COUNT = 3;
const RESULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_MEDIAN_DURATION_MS = 3;

type PerformanceRecord = {
  expiresAt: number;
  lastLoadId: number;
  samples: number[];
};

function runFixedWork(iterations: number) {
  let result = 0;
  for (let index = 1; index <= iterations; index += 1) {
    result += Math.sqrt(index) * (index % 7);
  }
  return result;
}

function readRecord(): PerformanceRecord | null {
  try {
    const record = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? 'null',
    ) as PerformanceRecord | null;
    if (
      !record ||
      record.expiresAt <= Date.now() ||
      !Array.isArray(record.samples)
    ) {
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

function meetsThreshold(samples: number[]) {
  if (samples.length === 0) return true;
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] <= MAX_MEDIAN_DURATION_MS;
}

export function useAnimationPerformanceGate() {
  const [animationsEnabled, setAnimationsEnabled] = useState(() =>
    meetsThreshold(readRecord()?.samples ?? []),
  );

  useEffect(() => {
    const existing = readRecord();
    if (
      existing?.samples.length === SAMPLE_COUNT ||
      existing?.lastLoadId === performance.timeOrigin
    ) {
      return;
    }

    let cancelled = false;
    let idleCallbackId: number | undefined;
    let timeoutId: number | undefined;

    // Keep the runtime feature check even though current DOM typings declare
    // requestIdleCallback as universally available. Narrowing `window` itself
    // would otherwise make the fallback branch `never`.
    const idleWindow: {
      requestIdleCallback?: Window['requestIdleCallback'];
    } = window;

    const benchmark = () => {
      if (cancelled || document.visibilityState !== 'visible') return;

      const latest = readRecord();
      if (
        latest?.samples.length === SAMPLE_COUNT ||
        latest?.lastLoadId === performance.timeOrigin
      ) {
        return;
      }

      // Warm up the loop so compilation time does not dominate the sample.
      runFixedWork(100_000);
      const startedAt = performance.now();
      const result = runFixedWork(1_000_000);
      const duration = performance.now() - startedAt;
      if (!Number.isFinite(result)) return;

      const samples = [...(latest?.samples ?? []), duration].slice(
        -SAMPLE_COUNT,
      );
      const record: PerformanceRecord = {
        expiresAt: latest?.expiresAt ?? Date.now() + RESULT_TTL_MS,
        lastLoadId: performance.timeOrigin,
        samples,
      };

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      } catch {
        // Storage can be unavailable in private or restricted contexts.
      }
      setAnimationsEnabled(meetsThreshold(samples));
    };

    const scheduleBenchmark = () => {
      if (document.visibilityState !== 'visible') return;
      document.removeEventListener('visibilitychange', scheduleBenchmark);

      if (idleWindow.requestIdleCallback) {
        idleCallbackId = idleWindow.requestIdleCallback(benchmark, {
          timeout: 2_000,
        });
      } else {
        timeoutId = window.setTimeout(benchmark, 1_000);
      }
    };

    if (document.visibilityState === 'visible') scheduleBenchmark();
    else document.addEventListener('visibilitychange', scheduleBenchmark);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', scheduleBenchmark);
      if (idleCallbackId !== undefined) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return animationsEnabled;
}
