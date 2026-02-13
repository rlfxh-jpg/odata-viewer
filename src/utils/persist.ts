const HISTORY_KEY = 'odata.metadata.history'

const readFromLocalStorage = (): string[] => {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

const writeToLocalStorage = (history: string[]) => {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export const loadHistory = async (): Promise<string[]> => {
  if (window.electronAPI?.getConfig) {
    try {
      const history = await window.electronAPI.getConfig(HISTORY_KEY)
      if (Array.isArray(history)) {
        return history.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      return readFromLocalStorage()
    }
  }
  return readFromLocalStorage()
}

export const saveHistory = async (history: string[]): Promise<void> => {
  if (window.electronAPI?.saveConfig) {
    try {
      window.electronAPI.saveConfig(HISTORY_KEY, history)
      return
    } catch {
      writeToLocalStorage(history)
      return
    }
  }
  writeToLocalStorage(history)
}
