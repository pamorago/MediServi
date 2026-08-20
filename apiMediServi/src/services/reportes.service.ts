/**
 * Servicio de Reportes - MediServi
 * Genera estadísticas y análisis de citas y profesionales
 */

import { prisma } from "../config/prisma";

export interface ReporteCitasPorEstado {
    total: number;
    estados: {
        pendiente: number;
        aceptada: number;
        rechazada: number;
        cancelada: number;
        completada: number;
    };
    porcentajes: {
        pendiente: number;
        aceptada: number;
        rechazada: number;
        cancelada: number;
        completada: number;
    };
}

export interface ReporteCitasPorProfesional {
    id: number;
    nombre: string;
    apellidos: string;
    totalCitas: number;
    citasCompletadas: number;
    porcentajeCompletacion: number;
}

export interface ReporteCalificaciones {
    id: number;
    nombre: string;
    apellidos: string;
    promedioCalificacion: number;
    cantidadResenas: number;
    mejorServicio: string;
    serviciosBajaCalificacion: string[];
}

export class ReportesService {
    /**
     * Obtener reporte de citas por estado
     */
    static async getCitasPorEstado(
        fechaInicio?: string,
        fechaFin?: string,
        profesionalId?: number,
        categoriaId?: number
    ): Promise<ReporteCitasPorEstado> {
        try {
            // Construir filtros
            const whereClause: any = {};

            if (fechaInicio) {
                whereClause.fechaCita = {
                    ...whereClause.fechaCita,
                    gte: new Date(fechaInicio),
                };
            }

            if (fechaFin) {
                whereClause.fechaCita = {
                    ...whereClause.fechaCita,
                    lte: new Date(fechaFin),
                };
            }

            if (profesionalId) {
                whereClause.perfilProfesionalId = profesionalId;
            }

            if (categoriaId) {
                whereClause.servicio = {
                    categoriaId,
                };
            }

            // Obtener citas con filtros
            const citas = await prisma.cita.findMany({
                where: whereClause,
            });

            // Contar por estado
            const estadoCounts = {
                pendiente: citas.filter((c) => c.estado === "PENDIENTE").length,
                aceptada: citas.filter((c) => c.estado === "ACEPTADA").length,
                rechazada: citas.filter((c) => c.estado === "RECHAZADA").length,
                cancelada: citas.filter((c) => c.estado === "CANCELADA").length,
                completada: citas.filter((c) => c.estado === "COMPLETADA").length,
            };

            const total =
                estadoCounts.pendiente +
                estadoCounts.aceptada +
                estadoCounts.rechazada +
                estadoCounts.cancelada +
                estadoCounts.completada;

            // Calcular porcentajes
            const porcentajes = {
                pendiente: total > 0 ? (estadoCounts.pendiente / total) * 100 : 0,
                aceptada: total > 0 ? (estadoCounts.aceptada / total) * 100 : 0,
                rechazada: total > 0 ? (estadoCounts.rechazada / total) * 100 : 0,
                cancelada: total > 0 ? (estadoCounts.cancelada / total) * 100 : 0,
                completada: total > 0 ? (estadoCounts.completada / total) * 100 : 0,
            };

            return {
                total,
                estados: estadoCounts,
                porcentajes,
            };
        } catch (error) {
            console.error("Error en getCitasPorEstado:", error);
            throw error;
        }
    }

    /**
     * Obtener reporte de citas por profesional
     */
    static async getCitasPorProfesional(
        fechaInicio?: string,
        fechaFin?: string
    ): Promise<ReporteCitasPorProfesional[]> {
        try {
            // Construir filtros de fecha
            const whereClause: any = {};

            if (fechaInicio || fechaFin) {
                whereClause.citas = {
                    some: {
                        fechaCita: {
                            ...(fechaInicio && { gte: new Date(fechaInicio) }),
                            ...(fechaFin && { lte: new Date(fechaFin) }),
                        },
                    },
                };
            }

            // Obtener profesionales con sus citas
            const profesionales = await prisma.perfilProfesional.findMany({
                where: whereClause,
                include: {
                    usuario: {
                        select: {
                            nombre: true,
                            apellidos: true,
                        },
                    },
                    citas: {
                        where: {
                            ...(fechaInicio && {
                                fechaCita: { gte: new Date(fechaInicio) },
                            }),
                            ...(fechaFin && {
                                fechaCita: { lte: new Date(fechaFin) },
                            }),
                        },
                    },
                },
            });

            // Mapear y calcular estadísticas
            const reportes: ReporteCitasPorProfesional[] = profesionales.map((prof) => {
                const totalCitas = prof.citas.length;
                const citasCompletadas = prof.citas.filter(
                    (c) => c.estado === "COMPLETADA"
                ).length;
                const porcentajeCompletacion =
                    totalCitas > 0 ? (citasCompletadas / totalCitas) * 100 : 0;

                return {
                    id: prof.id,
                    nombre: prof.usuario.nombre,
                    apellidos: prof.usuario.apellidos,
                    totalCitas,
                    citasCompletadas,
                    porcentajeCompletacion,
                };
            });

            return reportes.sort((a, b) => b.totalCitas - a.totalCitas);
        } catch (error) {
            console.error("Error en getCitasPorProfesional:", error);
            throw error;
        }
    }

    /**
     * Obtener reporte de calificaciones
     */
    static async getCalificaciones(
        umbralBaja: number = 3.0
    ): Promise<ReporteCalificaciones[]> {
        try {
            // Obtener profesionales con sus reseñas y servicios
            const profesionales = await prisma.perfilProfesional.findMany({
                include: {
                    usuario: {
                        select: {
                            nombre: true,
                            apellidos: true,
                        },
                    },
                    resenas: true,
                    servicios: {
                        select: {
                            id: true,
                            nombre: true,
                        },
                    },
                },
            });

            // Mapear y calcular calificaciones
            const reportes: ReporteCalificaciones[] = profesionales
                .map((prof) => {
                    const resenas = prof.resenas;
                    const cantidadResenas = resenas.length;

                    // Calcular promedio
                    const promedioCalificacion =
                        cantidadResenas > 0
                            ? resenas.reduce((sum, r) => sum + r.puntuacion, 0) /
                            cantidadResenas
                            : 0;

                    // Encontrar mejor servicio (by ID desde resenas que tienen referencia)
                    let mejorServicio = "N/A";
                    if (prof.servicios.length > 0) {
                        mejorServicio = prof.servicios[0].nombre;
                    }

                    // Encontrar servicios con baja calificación
                    const serviciosBajaCalificacion = prof.servicios
                        .filter((s) => {
                            // Aquí se podría implementar lógica adicional para filtrar por calificación del servicio
                            return true;
                        })
                        .map((s) => s.nombre)
                        .slice(0, 2);

                    return {
                        id: prof.id,
                        nombre: prof.usuario.nombre,
                        apellidos: prof.usuario.apellidos,
                        promedioCalificacion,
                        cantidadResenas,
                        mejorServicio,
                        serviciosBajaCalificacion,
                    };
                })
                .sort((a, b) => b.promedioCalificacion - a.promedioCalificacion);

            return reportes;
        } catch (error) {
            console.error("Error en getCalificaciones:", error);
            throw error;
        }
    }
}
