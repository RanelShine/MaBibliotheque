/** Génère un UUID simple */
export function generateId(): string {
    return 'xxxx-xxxx'.replace(/[x]/g, () =>
      ((Math.random() * 16) | 0).toString(16)
    );
  }
  
  /** Chargement/Enregistrement dans LocalStorage */
  export function loadFromStorage<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  
  export function saveToStorage<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }