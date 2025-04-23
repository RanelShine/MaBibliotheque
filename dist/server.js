var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Correction de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = 3000;
const dataPath = path.join(__dirname, '../data/medias.json');
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));
// Lire tous les médias
app.get('/api/medias', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const txt = yield fs.readFile(dataPath, 'utf-8');
        const list = JSON.parse(txt);
        res.json(list);
    }
    catch (err) {
        res.status(500).json({ error: 'Impossible de lire les données.' });
    }
}));
// Ajouter UN média
app.post('/api/medias', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newItem = req.body;
        const txt = yield fs.readFile(dataPath, 'utf-8');
        const list = JSON.parse(txt);
        const id = Date.now().toString();
        const item = Object.assign(Object.assign({}, newItem), { id });
        list.push(item);
        yield fs.writeFile(dataPath, JSON.stringify(list, null, 2));
        res.status(201).json(item);
    }
    catch (_a) {
        res.status(500).json({ error: 'Impossible d’ajouter le média.' });
    }
}));
// Ajouter PLUSIEURS médias
app.post('/api/medias/bulk', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const incoming = req.body;
        const txt = yield fs.readFile(dataPath, 'utf-8');
        const list = JSON.parse(txt);
        const added = incoming.map(item => {
            const id = Date.now().toString() + Math.random().toString().slice(2, 6);
            return Object.assign(Object.assign({}, item), { id });
        });
        const merged = list.concat(added);
        yield fs.writeFile(dataPath, JSON.stringify(merged, null, 2));
        res.status(201).json(added);
    }
    catch (_a) {
        res.status(500).json({ error: 'Impossible d’ajouter en masse.' });
    }
}));
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
