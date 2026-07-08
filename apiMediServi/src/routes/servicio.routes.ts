import { Router } from 'express';
import servicioController from '../controllers/servicio.controller';

const router = Router();

router.get('/', servicioController.getServicios);
router.get('/:id', servicioController.getServicio);
router.post('/', servicioController.createServicio);
router.put('/:id', servicioController.updateServicio);
router.patch('/:id/estado', servicioController.setEstadoServicio);

export default router;
