/** Maps items without allowing an arbitrarily large async fan-out. */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error('concurrency must be a positive integer');
  }

  const results = new Array<R>(items.length);
  let nextIndex = 0;
  let firstError: unknown;
  let hasError = false;

  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      try {
        results[index] = await mapper(items[index], index);
      } catch (error) {
        if (!hasError) firstError = error;
        hasError = true;
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker),
  );
  if (hasError) throw firstError;
  return results;
}
