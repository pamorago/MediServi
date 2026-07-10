import { Router } from 'express';
import imagenController from '../controllers/imagen.controller';

const router = Router();

router.post('/upload', imagenController.upload);
router.get('/files', imagenController.getListFiles);
router.get('/download/:name', imagenController.download);

export default router;
