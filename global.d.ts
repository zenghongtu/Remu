interface Window {
  timeoutId?: number;
  REMU_SYNC_DELAY?: number;
  REMU_TOKEN?: string;
  REMU_GIST_ID?: string;
  REMU_GIST_UPDATE_AT?: string;
}

declare module '*.json' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
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

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}
