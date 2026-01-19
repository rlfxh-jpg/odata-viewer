interface Window {
  electronAPI: {
    saveConfig: (key: string, value: any) => void;
    getConfig: (key: string) => Promise<any>;
  }
}