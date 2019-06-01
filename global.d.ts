interface Window {
  tabId?: number;
}

declare module '*.json' {
  const value: any;
  export default value;
}
