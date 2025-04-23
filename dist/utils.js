/** Génère un UUID simple */
export function generateId() {
    return 'xxxx-xxxx'.replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16));
}
/** Chargement/Enregistrement dans LocalStorage */
export function loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}
export function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
