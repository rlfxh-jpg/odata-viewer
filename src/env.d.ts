export {}

declare global {
  interface Window {
    electronAPI?: {
      saveConfig: (key: string, value: unknown) => void
      getConfig: (key: string) => Promise<unknown>
    }
  }
}
