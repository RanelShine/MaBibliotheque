import { fetchMedias, addMedia, addMany } from './services/apiService.js';
import { Media } from './models/media';

// DOM
const form = document.getElementById('media-form') as HTMLFormElement;
const listEl = document.getElementById('liste-medias')!;
const recherche = document.getElementById('recherche') as HTMLInputElement;
const importInput = document.getElementById('import-file') as HTMLInputElement;

let allMedias: Media[] = [];

// Afficher une liste
function render(list: Media[]) {
  listEl.innerHTML = '';
  list.forEach(m => {
    const div = document.createElement('div');
    div.className = 'media';
    div.innerHTML = `
      <strong>${m.titre}</strong>
      <p>${m.type} — ${m.auteur || ''} (${m.annee||''})</p>
      ${m.fileUrl ? `<a href="${m.fileUrl}" download>Télécharger</a>` : ''}
    `;
    listEl.append(div);
  });
}

// Charger et afficher
async function loadAndRender() {
  allMedias = await fetchMedias();
  render(allMedias);
}

// Recherche filtree
recherche.addEventListener('input', () => {
  const q = recherche.value.toLowerCase();
  render(
    allMedias.filter(m => m.titre.toLowerCase().includes(q))
  );
});

// Soumission du formulaire
form.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(form);
  const base = {
    titre: formData.get('titre') as string,
    auteur: formData.get('auteur') as string,
    type: formData.get('type') as any,
    genre: formData.get('genre') as string,
    annee: Number(formData.get('annee')),
    note: Number(formData.get('note')),
    critique: formData.get('critique') as string
  };

  // Si import de fichiers
  const files = importInput.files;
  if (files && files.length) {
    const toBulk: Omit<Media,'id'>[] = [];
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      let mime = file.type;
      toBulk.push({ ...base, titre: file.name, fileUrl: url, mimeType: mime });
    });
    await addMany(toBulk);
  } else {
    await addMedia(base);
  }

  form.reset();
  importInput.value = '';
  loadAndRender();
});

// Init
loadAndRender();
