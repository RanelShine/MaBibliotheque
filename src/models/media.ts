export interface Media {
  id: string;
  titre: string;
  auteur?: string;        // auteur / réalisateur / artiste
  type: 'livre'|'film'|'musique';
  genre?: string;
  annee?: number;
  note?: number;
  critique?: string;
  fileUrl?: string;       // URL Blob pour téléchargement
  mimeType?: string;
  coverUrl?: string;
}
