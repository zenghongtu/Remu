interface Window {
  tabId?: number;
  REMU_TOKEN?: string;
}

declare module '*.json' {
  const value: any;
  export default value;
}
