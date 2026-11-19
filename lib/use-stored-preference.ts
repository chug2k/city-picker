import { useSyncExternalStore } from "react";

const changeEvent = "cityPickerPreferenceChanged";
const unsaved = new Map<string, string>();

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}

// The server renders defaults. Hydration reads the existing keys without writing to them.
export function useStoredPreference(key: string) {
  const value = useSyncExternalStore(subscribe, () => {
    try {
      return unsaved.get(key) ?? localStorage.getItem(key);
    } catch {
      return null;
    }
  }, () => null);

  function save(next: string) {
    try {
      localStorage.setItem(key, next);
      unsaved.delete(key);
    } catch {
      // Keep the controls usable for this visit if the browser blocks storage.
      unsaved.set(key, next);
    }
    window.dispatchEvent(new Event(changeEvent));
  }

  return [value, save] as const;
}
