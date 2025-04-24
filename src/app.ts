import { fetchMedias, addMedia, addMany } from './services/apiService.js';
import { Media } from './models/media';

// DOM
const form = document.getElementById('media-form') as HTMLFormElement;
const listEl = document.getElementById('liste-medias')!;
const recherche = document.getElementById('recherche') as HTMLInputElement;
const importInput = document.getElementById('import-file') as HTMLInputElement;
const filtreTitre = document.getElementById('filtre-titre') as HTMLInputElement;
const filtreAuteur = document.getElementById('filtre-auteur') as HTMLInputElement;
const filtreAnnee = document.getElementById('filtre-annee') as HTMLInputElement;
const btnReset = document.getElementById('btn-reset-filtre') as HTMLButtonElement;

// Define allMedias as an array of Media objects
let allMedias: Media[] = [];

// let allMedias: Media[] = [];

// Afficher une liste
function render(list: Media[]) {
  listEl.innerHTML = '';
  list.forEach(m => {
    const tr = document.createElement("tr");
    tr.className = 'media';
    tr.innerHTML = `
    <td>${m.type}</td>
    <td>${m.titre}</td>
    <td>${m.auteur}</td>
    <td>${m.annee}</td>
    <td>${m.genre}</td>
    <td>${m.note}</td>
    <td>${m.critique}</td>
    <td>${m.fileUrl ? `<a href="${m.fileUrl}" download>Télécharger</a>` : ''}</td>
  `;
  listEl.append(tr);
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



// Fonction de filtrage
function filtrerMedias() {
  const titre = filtreTitre.value.toLowerCase();
  const auteur = filtreAuteur.value.toLowerCase();
  const annee = filtreAnnee.value;

  const resultats = allMedias.filter(m => {
    const matchTitre = m.titre.toLowerCase().includes(titre);
    const matchAuteur = (m.auteur ?? '').toLowerCase().includes(auteur);
    const matchAnnee = annee ? m.annee === Number(annee) : true;

    return matchTitre && matchAuteur && matchAnnee;
  });

  render(resultats);
}

// Appliquer le filtre quand on tape
filtreTitre.addEventListener('input', filtrerMedias);
filtreAuteur.addEventListener('input', filtrerMedias);
filtreAnnee.addEventListener('input', filtrerMedias);

// Bouton de réinitialisation
btnReset.addEventListener('click', () => {
  filtreTitre.value = '';
  filtreAuteur.value = '';
  filtreAnnee.value = '';
  render(allMedias);
});
// Removed duplicate render function implementation.



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
