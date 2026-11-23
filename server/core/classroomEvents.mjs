// In-memory pub/sub per class. Payload is only an event name: clients refetch what they may read.
const normalize = (value) => String(value || '').trim().toUpperCase();

export function createClassroomEvents() {
  const listeners = new Map();
  return {
    subscribe(classCode, listener) {
      const key = normalize(classCode);
      const set = listeners.get(key) || new Set();
      set.add(listener);
      listeners.set(key, set);
      return () => {
        set.delete(listener);
        if (set.size === 0) listeners.delete(key);
      };
    },
    /** @param {'classroom' | 'control'} type */
    publish(classCode, type = 'classroom') {
      for (const listener of listeners.get(normalize(classCode)) || []) {
        try { listener(type); } catch { /* a closed stream cannot fail a saved change */ }
      }
    },
  };
}
