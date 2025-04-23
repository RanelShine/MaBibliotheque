import { Media } from '../models/media.js';

const API = '/api/medias';

export async function fetchMedias(): Promise<Media[]> {
  const r = await fetch(API);
  return r.json();
}

export async function addMedia(item: Omit<Media,'id'>): Promise<Media> {
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(item)
  });
  return r.json();
}

export async function addMany(items: Omit<Media,'id'>[]): Promise<Media[]> {
  const r = await fetch(API + '/bulk', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(items)
  });
  return r.json();
}
