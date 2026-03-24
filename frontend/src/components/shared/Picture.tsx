import { breakpoints } from '@/utils/breakpoints';

/**
 * PictureSrc variants:
 * - string: plain <img> src
 * - { webp, avif }: <picture> with AVIF + WebP fallback
 * - { webp, avif, mobile }: same, plus a mobile AVIF served below 640px
 *
 * mobile.avif is typically a smaller or differently-cropped variant generated
 * by vite-imagetools at build time (e.g. ?w=900&h=1000&fit=cover&format=avif).
 * Served below breakpoints.mobile (see utils/breakpoints.ts).
 * Only AVIF is needed for mobile since all browsers that support <picture> media
 * queries also support AVIF.
 */
export type PictureSrc =
  | { webp: string; avif: string; mobile?: { avif: string } }
  | string;

type PictureProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: PictureSrc;
};

/**
 * Universal image component. Accepts either a plain string src (renders a plain <img>)
 * or a { webp, avif } object (renders a <picture> with AVIF source + WebP fallback).
 * Optionally accepts a mobile.avif for art-directed mobile crops served below 640px.
 *
 * className and style are applied to both the <picture> wrapper and the inner <img>
 * so layout (h-full, w-full, etc.) and object-fit work correctly.
 *
 * Use the asset index files in src/assets/ to get typed { webp, avif } objects.
 */
export function Picture({ src, alt = '', className, style, ...imgProps }: PictureProps) {
  if (typeof src === 'string') {
    return <img src={src} alt={alt} className={className} style={style} {...imgProps} />;
  }

  return (
    <picture className={className} style={style}>
      {src.mobile && (
        <source media={`(max-width: ${breakpoints.mobile}px)`} type="image/avif" srcSet={src.mobile.avif} />
      )}
      <source type="image/avif" srcSet={src.avif} />
      <img
        src={src.webp}
        alt={alt}
        className={className}
        style={style}
        {...imgProps}
      />
    </picture>
  );
}
