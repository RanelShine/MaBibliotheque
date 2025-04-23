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
// Define allMedias as an array of Media objects
let allMedias = [];
// let allMedias: Media[] = [];
// Afficher une liste
function render(list) {
    listEl.innerHTML = '';
    list.forEach(m => {
        const div = document.createElement('div');
        div.className = 'media';
        div.innerHTML = `
      <strong>${m.titre}</strong>
      <p>${m.type} — ${m.auteur || ''} (${m.annee || ''})</p>
      ${m.fileUrl ? `<a href="${m.fileUrl}" download>Télécharger</a>` : ''}
    `;
        listEl.append(div);
    });
}
// Charger et afficher
function loadAndRender() {
    return __awaiter(this, void 0, void 0, function* () {
        allMedias = yield fetchMedias();
        render(allMedias);
    });
}
// Recherche filtree
recherche.addEventListener('input', () => {
    const q = recherche.value.toLowerCase();
    render(allMedias.filter(m => m.titre.toLowerCase().includes(q)));
});
// Fonction de filtrage
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
form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
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
    // Si import de fichiers
    const files = importInput.files;
    if (files && files.length) {
        const toBulk = [];
        Array.from(files).forEach(file => {
            const url = URL.createObjectURL(file);
            let mime = file.type;
            toBulk.push(Object.assign(Object.assign({}, base), { titre: file.name, fileUrl: url, mimeType: mime }));
        });
        yield addMany(toBulk);
    }
    else {
        yield addMedia(base);
    }
    form.reset();
    importInput.value = '';
    loadAndRender();
}));
// Init
loadAndRender();
