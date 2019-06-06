interface Window {
  tabId?: number;
  REMU_TOKEN?: string;
  REMU_GIST_ID?: string;
  REMU_GIST_UPDATE_AT?: string;
}

declare module '*.json' {
  const value: any;
  export default value;
}
