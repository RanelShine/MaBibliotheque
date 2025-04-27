import express from 'express';
import multer from 'multer';
const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // Où enregistrer
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });
router.post('/', upload.single('cover'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Pas de fichier envoyé' });
    }
    res.json({
        fileUrl: '/uploads/' + req.file.filename
    });
});
export default router;
