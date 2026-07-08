import { Router } from 'express';
import profesionalController from '../controllers/profesional.controller';

const router = Router();

router.get('/', profesionalController.getProfesionales);
router.get('/:id', profesionalController.getProfesional);
router.post('/', profesionalController.createProfesional);
router.put('/:id', profesionalController.updateProfesional);
router.patch('/:id/disponibilidad', profesionalController.setDisponibilidad);

export default router;
