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

// Dropdown & Modal Elements
const btnCategories = document.getElementById('btn-categories') as HTMLButtonElement;
const dropdownCategories = document.getElementById('dropdown-categories') as HTMLDivElement;
const modalOverlay = document.getElementById('modal-overlay') as HTMLDivElement;
const modalTitle = document.getElementById('modal-title') as HTMLHeadingElement;
const modalBody = document.getElementById('modal-body') as HTMLDivElement;
const modalClose = document.getElementById('modal-close') as HTMLButtonElement;

// Toutes les données
let allMedias: Media[] = [];
const CATEGORIES = ['livre', 'film', 'musique'];

/**
 * Construit le HTML des cartes de médias pour un type donné
 */
function buildMediaCards(type: string): string {
  const filtered = allMedias.filter(m => m.type.toLowerCase() === type);
  if (filtered.length === 0) {
    return `<p class="text-center">Aucun ${type} trouvé.</p>`;
  }
  return filtered.map(m => 
    `<div class="shadow-sm border rounded-lg p-4 mb-4">
      <h3 class="font-semibold text-green-700">Titre : ${m.titre}</h3>
      <p>Auteur : ${m.auteur}</p>
      <p>Année : ${m.annee}</p>
      <p>Genre : ${m.genre}</p>
      <p>Note : ${m.note}</p>
      <p><em>Critique : ${m.critique}</em></p>
      ${m.fileUrl ?
        `<a href="${m.fileUrl}" download class="text-blue-600 underline mt-2 inline-block hover:text-green-800">Télécharger</a>`
        : ''
      }
    </div>`
  ).join('');
}

/**
 * Affiche la liste des médias dans la modale
 */
function renderByType(type: string) {
  modalTitle.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)}s`;
  modalBody.innerHTML = buildMediaCards(type);
  modalOverlay.classList.remove('hidden');
}

// ─── Gestion du dropdown ─────────────────────────────────────────
btnCategories.addEventListener('click', e => {
  e.stopPropagation();
  dropdownCategories.classList.toggle('hidden');
});
document.addEventListener('click', () => {
  dropdownCategories.classList.add('hidden');
});
dropdownCategories.querySelectorAll('a[data-type]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const type = (link as HTMLElement).dataset.type!;
    renderByType(type);
  });
});

// ─── Gestion de la modale ────────────────────────────────────────
modalClose.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
});
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.add('hidden');
  }
});

/** Affichage dans le tableau (vue brute) */
function render(list: Media[]) {
  listEl.innerHTML = '';
  list.forEach(m => {
    const tr = document.createElement('tr');
    tr.className = 'media';
    tr.innerHTML = `
      <td class="px-4 py-2 whitespace-normal break-words max-w-xs">${m.type}</td>
      <td class="px-4 py-2 whitespace-normal break-words max-w-xs">${m.titre}</td>
      <td class="px-4 py-2 whitespace-normal break-words max-w-xs">${m.auteur}</td>
      <td class="px-4 py-2 whitespace-normal break-words max-w-xs">${m.annee}</td>
      <td class="px-4 py-2 whitespace-normal break-words max-w-xs">${m.genre}</td>
      <td class="px-4 py-2 whitespace-normal break-words max-w-xs">${m.note}</td>
      <td class="px-4 py-2 whitespace-normal break-words max-w-xs">${m.critique}</td>
      <a href="${m.fileUrl}" download class="text-blue-600 underline px-4 py-2 hover:text-green-800">Télécharger</a>
    `;
    listEl.append(tr);
  });
}

// ─── Chargement initial des médias ───────────────────────────────
async function loadAndRender() {
  allMedias = await fetchMedias();
  render(allMedias);
}

// ─── Recherche par titre ─────────────────────────────────────────
recherche.addEventListener('input', () => {
  const q = recherche.value.toLowerCase();
  render(allMedias.filter(m => m.titre.toLowerCase().includes(q)));
});

// ─── Filtres multiples ────────────────────────────────────────────
function filtrerMedias() {
  const titre = filtreTitre.value.toLowerCase();
  const auteur = filtreAuteur.value.toLowerCase();
  const annee  = filtreAnnee.value;
  const resultats = allMedias.filter(m => {
    const matchTitre  = m.titre.toLowerCase().includes(titre);
    const matchAuteur = (m.auteur ?? '').toLowerCase().includes(auteur);
    const matchAnnee  = annee ? m.annee === Number(annee) : true;
    return matchTitre && matchAuteur && matchAnnee;
  });
  render(resultats);
}
filtreTitre.addEventListener('input', filtrerMedias);
filtreAuteur.addEventListener('input', filtrerMedias);
filtreAnnee.addEventListener('input', filtrerMedias);
btnReset.addEventListener('click', () => {
  filtreTitre.value = '';
  filtreAuteur.value = '';
  filtreAnnee.value = '';
  render(allMedias);
});

// ─── Soumission du formulaire ─────────────────────────────────────
form.addEventListener('submit', async e => {
  e.preventDefault();

  // 1) Récupération des valeurs du formulaire
  const formData = new FormData(form);
  const base = {
    titre:    formData.get('titre')    as string,
    auteur:   formData.get('auteur')   as string,
    type:     formData.get('type')     as any,
    genre:    formData.get('genre')    as string,
    annee:    Number(formData.get('annee')),
    note:     Number(formData.get('note')),
    critique: formData.get('critique') as string
  };

  // 2) Préparation du ou des médias à envoyer
  const files = importInput.files;
  if (files && files.length) {
    
    const toBulk: Omit<Media,'id'>[] = [];
    Array.from(files).forEach(file => {
      const url  = URL.createObjectURL(file);
      const mime = file.type;
     
      toBulk.push({
        ...base,
        fileUrl:  url,
        mimeType: mime
      });
    });
    await addMany(toBulk);  
  } else {
    
    await addMedia(base);
  }


  form.reset();            
  importInput.value = '';  
  await loadAndRender();   
});


// ─── Initialisation ─────────────────────────────────────────────
loadAndRender();
