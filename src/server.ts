import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Media } from './models/media.js';
import uploadRoute from './routes/upload.js';





// Correction de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const dataPath = path.join(__dirname, '../data/medias.json');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoute);


// Lire tous les médias
app.get('/api/medias', async (_, res) => {
  try {
    const txt = await fs.readFile(dataPath, 'utf-8');
    const list: Media[] = JSON.parse(txt);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Impossible de lire les données.' });
  }
});

// Ajouter UN média
app.post('/api/medias', async (req, res) => {
  try {
    const newItem: Omit<Media, 'id'> = req.body;
    const txt = await fs.readFile(dataPath, 'utf-8');
    const list: Media[] = JSON.parse(txt);
    const id = Date.now().toString();
    const item: Media = { ...newItem, id };
    list.push(item);
    await fs.writeFile(dataPath, JSON.stringify(list, null, 2));
    res.status(201).json(item);
  } catch {
    res.status(500).json({ error: 'Impossible d’ajouter le média.' });
  }
});

// Supprimer un média par son id
app.delete('/api/medias/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const txt = await fs.readFile(dataPath, 'utf-8');
    let list: Media[] = JSON.parse(txt);
    list = list.filter(m => m.id !== id);
    await fs.writeFile(dataPath, JSON.stringify(list, null, 2));
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Impossible de supprimer le média.' });
  }
});

// Mettre à jour un média par son id
app.put('/api/medias/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updated: Omit<Media,'id'> = req.body;
    const txt = await fs.readFile(dataPath, 'utf-8');
    const list: Media[] = JSON.parse(txt);
    const idx = list.findIndex(m => m.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Média non trouvé' });

    list[idx] = { ...updated, id };
    await fs.writeFile(dataPath, JSON.stringify(list, null, 2));
    res.json(list[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Impossible de modifier le média.' });
  }
});


// Ajouter PLUSIEURS médias
app.post('/api/medias/bulk', async (req, res) => {
  try {
    const incoming: Omit<Media, 'id'>[] = req.body;
    const txt = await fs.readFile(dataPath, 'utf-8');
    const list: Media[] = JSON.parse(txt);
    const added = incoming.map(item => {
      const id = Date.now().toString() + Math.random().toString().slice(2,6);
      return { ...item, id };
    });
    const merged = list.concat(added);
    await fs.writeFile(dataPath, JSON.stringify(merged, null, 2));
    res.status(201).json(added);
  } catch {
    res.status(500).json({ error: 'Impossible d’ajouter en masse.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
