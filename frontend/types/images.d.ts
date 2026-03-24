declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.webp?format=avif' {
  const src: string;
  export default src;
}

// vite-imagetools transform variants — add a declaration for each new query string used
declare module '*.webp?w=900&h=1125&fit=cover&position=bottom&format=avif' {
  const src: string;
  export default src;
}

declare module '*.webp?w=1200&format=avif' {
  const src: string;
  export default src;
}

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
