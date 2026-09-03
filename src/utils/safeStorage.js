// Wraps localStorage so the app never crashes if it's unavailable or throws.
// Chrome (and others) can throw a SecurityError just from touching
// `window.localStorage` on a file:// page under certain privacy settings —
// not just from calling a method on it. Falls back to an in-memory store,
// scoped to the current page load, so the app still works for that session.

function createMemoryStore() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)); },
    removeItem: (key) => { store.delete(key); },
  };
}

function detectLocalStorage() {
  try {
    const testKey = '__atomic_recall_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

const backing = (typeof window !== 'undefined' && detectLocalStorage()) || createMemoryStore();

export function safeGetItem(key) {
  try {
    return backing.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key, value) {
  try {
    backing.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
