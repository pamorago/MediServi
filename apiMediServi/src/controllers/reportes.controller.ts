/**
 * Controlador de Reportes - MediServi
 */

import { Request, Response } from "express";
import { ReportesService } from "../services/reportes.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/prisma";

export class ReportesController {
    /**
     * GET /reportes/citas-por-estado
     * Obtener reporte de citas por estado
     */
    static async getCitasPorEstado(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { fechaInicio, fechaFin, categoriaId } = req.query;
            let { profesionalId } = req.query;

            // Un PROFESIONAL solo puede ver su propio reporte: no se confia en
            // el profesionalId que mande el cliente, se resuelve del token.
            // Sin este resguardo, si el frontend por alguna razon no logra
            // resolver el perfil propio, el profesional terminaria viendo el
            // reporte de TODA la plataforma en vez de solo el suyo.
            if (req.userRole === "PROFESIONAL") {
                const perfilPropio = await prisma.perfilProfesional.findFirst({
                    where: { usuarioId: req.userId },
                    select: { id: true },
                });
                profesionalId = perfilPropio ? String(perfilPropio.id) : "-1";
            }

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

            const { fechaInicio, fechaFin, profesionalId } = req.query;

            const reporte = await ReportesService.getCitasPorProfesional(
                fechaInicio as string,
                fechaFin as string,
                profesionalId ? parseInt(profesionalId as string) : undefined
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

            const { umbralBaja, profesionalId } = req.query;

            const reporte = await ReportesService.getCalificaciones(
                umbralBaja ? parseFloat(umbralBaja as string) : 3.0,
                profesionalId ? parseInt(profesionalId as string) : undefined
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
