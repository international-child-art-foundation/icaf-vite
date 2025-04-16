// Gallery.tsx

import { useSuspenseQuery } from "@tanstack/react-query";
import { GalleryContent } from "./GalleryContent";
import { GalleryContentLoading } from "./GalleryContentLoading";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

import { Suspense } from "react";

const fetchArtworks = async () => {
  // const res = await fetch("/api/artworks");
  // if (!res.ok) throw new Error("Failed to fetch");
  // return res.json();
};

export const Gallery = () => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ resetErrorBoundary }: FallbackProps) => (
          <div>
            Error loading gallery.
            <button onClick={resetErrorBoundary}>Try again</button>
          </div>
        )}
      >
        <Suspense fallback={<GalleryContentLoading />}>
          <GalleryInner />
        </Suspense>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

const GalleryInner = () => {
  const { data } = useSuspenseQuery({
    queryKey: ["artworks"],
    queryFn: fetchArtworks,
  });

  return <GalleryContent artworks={data} />;
};
