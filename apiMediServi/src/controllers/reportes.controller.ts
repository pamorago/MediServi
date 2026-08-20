/**
 * Controlador de Reportes - MediServi
 */

import { Request, Response } from "express";
import { ReportesService } from "../services/reportes.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class ReportesController {
    /**
     * GET /reportes/citas-por-estado
     * Obtener reporte de citas por estado
     */
    static async getCitasPorEstado(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { fechaInicio, fechaFin, profesionalId, categoriaId } = req.query;

            const reporte = await ReportesService.getCitasPorEstado(
                fechaInicio as string,
                fechaFin as string,
                profesionalId ? parseInt(profesionalId as string) : undefined,
                categoriaId ? parseInt(categoriaId as string) : undefined
            );

            res.status(200).json({
                success: true,
                data: reporte,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Error al obtener reporte de citas por estado",
            });
        }
    }

    /**
     * GET /reportes/citas-por-profesional
     * Obtener reporte de citas por profesional (solo ADMINISTRADOR)
     */
    static async getCitasPorProfesional(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> {
        try {
            // Validar que sea administrador
            if (req.userRole !== "ADMINISTRADOR") {
                res.status(403).json({
                    success: false,
                    message: "Acceso denegado. Se requiere rol ADMINISTRADOR",
                });
                return;
            }

            const { fechaInicio, fechaFin } = req.query;

            const reporte = await ReportesService.getCitasPorProfesional(
                fechaInicio as string,
                fechaFin as string
            );

            res.status(200).json({
                success: true,
                data: reporte,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Error al obtener reporte de profesionales",
            });
        }
    }

    /**
     * GET /reportes/calificaciones
     * Obtener reporte de calificaciones de profesionales (solo ADMINISTRADOR)
     */
    static async getCalificaciones(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> {
        try {
            // Validar que sea administrador
            if (req.userRole !== "ADMINISTRADOR") {
                res.status(403).json({
                    success: false,
                    message: "Acceso denegado. Se requiere rol ADMINISTRADOR",
                });
                return;
            }

            const { umbralBaja } = req.query;

            const reporte = await ReportesService.getCalificaciones(
                umbralBaja ? parseFloat(umbralBaja as string) : 3.0
            );

            res.status(200).json({
                success: true,
                data: reporte,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Error al obtener reporte de calificaciones",
            });
        }
    }
}
