var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fetchMedias, addMedia, addMany } from './services/apiService.js';
// DOM
const form = document.getElementById('media-form');
const listEl = document.getElementById('liste-medias');
const recherche = document.getElementById('recherche');
const importInput = document.getElementById('import-file');
const filtreTitre = document.getElementById('filtre-titre');
const filtreAuteur = document.getElementById('filtre-auteur');
const filtreAnnee = document.getElementById('filtre-annee');
const btnReset = document.getElementById('btn-reset-filtre');
// Dropdown & Modal Elements
const btnCategories = document.getElementById('btn-categories');
const dropdownCategories = document.getElementById('dropdown-categories');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
// Toutes les données
let allMedias = [];
const CATEGORIES = ['livre', 'film', 'musique'];
/**
 * Construit le HTML des cartes de médias pour un type donné
 */
function buildMediaCards(type) {
    const filtered = allMedias.filter(m => m.type.toLowerCase() === type);
    if (filtered.length === 0) {
        return `<p class="text-center">Aucun ${type} trouvé.</p>`;
    }
    return filtered.map(m => `<div class="shadow-sm border rounded-lg p-4 mb-4">
      <h3 class="font-semibold text-green-700">Titre : ${m.titre}</h3>
      <p>Auteur : ${m.auteur}</p>
      <p>Année : ${m.annee}</p>
      <p>Genre : ${m.genre}</p>
      <p>Note : ${m.note}</p>
      <p><em>Critique : ${m.critique}</em></p>
      ${m.fileUrl ?
        `<a href="${m.fileUrl}" download class="text-blue-600 underline mt-2 inline-block hover:text-green-800">Télécharger</a>`
        : ''}
    </div>`).join('');
}
/**
 * Affiche la liste des médias dans la modale
 */
function renderByType(type) {
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
        const type = link.dataset.type;
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
import { deleteMedia } from './services/apiService.js';
// …
function render(list) {
    listEl.innerHTML = '';
    list.forEach(m => {
        const card = document.createElement('div');
        card.className = 'shadow-sm border rounded-lg p-4 bg-white flex flex-col justify-between hover:shadow-lg transition-shadow';
        card.innerHTML = `
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
        ${m.fileUrl ? `
          <a href="${m.fileUrl}" download class="text-blue-600 underline hover:text-green-800">
            Télécharger
          </a>` : ''}
        <button data-id="${m.id}"
                class="delete-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
          Supprimer
        </button>
      </div>
    `;
        listEl.appendChild(card);
    });
    // Après avoir injecté toutes les cartes, ajoute les listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
            const id = e.currentTarget.dataset.id;
            yield deleteMedia(id);
            // Retirer en front ou recharger la liste
            allMedias = allMedias.filter(m => m.id !== id);
            render(allMedias);
        }));
    });
}
// ─── Chargement initial des médias ───────────────────────────────
function loadAndRender() {
    return __awaiter(this, void 0, void 0, function* () {
        allMedias = yield fetchMedias();
        render(allMedias);
    });
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
    const annee = filtreAnnee.value;
    const resultats = allMedias.filter(m => {
        var _a;
        const matchTitre = m.titre.toLowerCase().includes(titre);
        const matchAuteur = ((_a = m.auteur) !== null && _a !== void 0 ? _a : '').toLowerCase().includes(auteur);
        const matchAnnee = annee ? m.annee === Number(annee) : true;
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
form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    // 1) Récupération des valeurs du formulaire
    const formData = new FormData(form);
    const base = {
        titre: formData.get('titre'),
        auteur: formData.get('auteur'),
        type: formData.get('type'),
        genre: formData.get('genre'),
        annee: Number(formData.get('annee')),
        note: Number(formData.get('note')),
        critique: formData.get('critique')
    };
    // 2) Préparation du ou des médias à envoyer
    const files = importInput.files;
    if (files && files.length) {
        const toBulk = [];
        Array.from(files).forEach(file => {
            const url = URL.createObjectURL(file);
            const mime = file.type;
            toBulk.push(Object.assign(Object.assign({}, base), { fileUrl: url, mimeType: mime }));
        });
        yield addMany(toBulk);
    }
    else {
        yield addMedia(base);
    }
    form.reset();
    importInput.value = '';
    yield loadAndRender();
}));
// ─── Initialisation ─────────────────────────────────────────────
loadAndRender();
