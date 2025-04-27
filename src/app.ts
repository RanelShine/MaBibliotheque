import { fetchMedias, addMedia, addMany } from './services/apiService.js';
import { Media } from './models/media';
import { deleteMedia } from './services/apiService.js';

// DOM
const form = document.getElementById('media-form') as HTMLFormElement;
const listEl = document.getElementById('liste-medias')!;
const recherche = document.getElementById('recherche') as HTMLInputElement;
const importInput = document.getElementById('import-file') as HTMLInputElement;
const coverInput = document.getElementById('cover-file') as HTMLInputElement;
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

/** Affichage */

// …

function render(list: Media[]) {
  listEl.innerHTML = '';

  list.forEach(m => {
    const card = document.createElement('div');
    card.className =
      'shadow-sm border rounded-lg bg-white overflow-hidden hover:shadow-lg transition-shadow';

    card.innerHTML = `
      <!-- Affichage de la couverture si présente -->
      ${m.coverUrl
        ? `<img
             src="${m.coverUrl}"
             alt="Couverture de ${m.titre}"
             class="w-full h-32 object-cover"`
        + ` rounded-t-lg mb-2`
        + ` />`
        : ''
      }

      <div class="p-4 flex flex-col justify-between h-full">
        <div>
          <h3 class="text-xl font-bold text-green-700 mb-2">${m.titre}</h3>
          <p class="text-sm text-gray-700"><strong>Type :</strong> ${m.type}</p>
          <p class="text-sm text-gray-700"><strong>Auteur :</strong> ${m.auteur}</p>
          <p class="text-sm text-gray-700"><strong>Année :</strong> ${m.annee}</p>
          <p class="text-sm text-gray-700"><strong>Genre :</strong> ${m.genre}</p>
          <p class="text-sm text-gray-700"><strong>Note :</strong> ${m.note} / 5</p>
          ${m.critique ? `<p class="mt-2 italic text-gray-600">“${m.critique}”</p>` : ''}
        </div>
        <div class="mt-4 flex justify-between items-center">
          ${m.fileUrl
            ? `<a href="${m.fileUrl}" download
                  class="text-blue-600 underline hover:text-green-800">
                 Télécharger
               </a>`
            : ''
          }
          <button data-id="${m.id}"
                  class="delete-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
            Supprimer
          </button>
        </div>
      </div>
    `.trim();

    listEl.appendChild(card);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      await deleteMedia(id);
      allMedias = allMedias.filter(m => m.id !== id);
      render(allMedias);
    });
  });
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('cover', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Erreur pendant l’upload de l’image');
  }

  const data = await response.json();
  return data.fileUrl; // => '/uploads/nomdufichier.jpg'
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

  let coverUrl: string | undefined = undefined;
  
  // Gestion de la cover
  if (coverInput.files && coverInput.files.length > 0) {
    const coverFile = coverInput.files[0];
    coverUrl = await uploadImage(coverFile);
  }

  // Gestion du/ des fichiers médias
  if (importInput.files && importInput.files.length > 0) {
    const toBulk: Omit<Media, 'id'>[] = [];

    Array.from(importInput.files).forEach(file => {
      const url = URL.createObjectURL(file); // ou utiliser upload ici si besoin
      const mime = file.type;

      toBulk.push({
        ...base,
        coverUrl,
        fileUrl: url,
        mimeType: mime
      });
    });

    await addMany(toBulk);
  } else {
    await addMedia({ ...base, coverUrl });
  }

  form.reset();
  importInput.value = '';
  coverInput.value = '';
  await loadAndRender();
});




// ─── Initialisation ─────────────────────────────────────────────
loadAndRender();
// function uploadImage(arg0: File): string | PromiseLike<string | undefined> | undefined {
//   throw new Error('Function not implemented.');
// }

