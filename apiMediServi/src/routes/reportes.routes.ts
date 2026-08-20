/**
 * Rutas de Reportes - MediServi
 */

import { Router } from "express";
import { ReportesController } from "../controllers/reportes.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

/**
 * GET /reportes/citas-por-estado
 * Obtener reporte de citas por estado
 * Query params: fechaInicio, fechaFin, profesionalId, categoriaId
 */
router.get("/citas-por-estado", verifyJWT, ReportesController.getCitasPorEstado);

/**
 * GET /reportes/citas-por-profesional
 * Obtener reporte de citas por profesional (requiere ADMINISTRADOR)
 * Query params: fechaInicio, fechaFin
 */
router.get(
    "/citas-por-profesional",
    verifyJWT,
    ReportesController.getCitasPorProfesional
);

/**
 * GET /reportes/calificaciones
 * Obtener reporte de calificaciones (requiere ADMINISTRADOR)
 * Query params: umbralBaja
 */
router.get(
    "/calificaciones",
    verifyJWT,
    ReportesController.getCalificaciones
);

export default router;
