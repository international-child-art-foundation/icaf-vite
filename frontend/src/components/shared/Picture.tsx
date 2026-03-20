export type PictureSrc = { webp: string; avif: string } | string;

type PictureProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: PictureSrc;
};

/**
 * Universal image component. Accepts either a plain string src (renders a plain <img>)
 * or a { webp, avif } object (renders a <picture> with AVIF source + WebP fallback).
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
