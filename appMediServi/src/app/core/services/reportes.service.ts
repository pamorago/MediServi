import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * El API de reportes envuelve siempre la respuesta como
 * { success, data }. Los métodos de este servicio se encargan
 * de desempaquetar `data` para que los componentes reciban
 * directamente el reporte tipado.
 */
interface ReporteEnvelope<T> {
    success: boolean;
    message?: string;
    data: T;
}

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

@Injectable({
    providedIn: 'root',
})
export class ReportesService {
    private apiUrl = 'http://localhost:3000/api/reportes';

    constructor(private http: HttpClient) { }

    /**
     * Obtener reporte de citas por estado
     */
    getCitasPorEstado(
        fechaInicio?: string,
        fechaFin?: string,
        profesionalId?: number,
        categoriaId?: number
    ): Observable<ReporteCitasPorEstado> {
        let url = `${this.apiUrl}/citas-por-estado`;
        const params = new URLSearchParams();

        if (fechaInicio) params.append('fechaInicio', fechaInicio);
        if (fechaFin) params.append('fechaFin', fechaFin);
        if (profesionalId) params.append('profesionalId', profesionalId.toString());
        if (categoriaId) params.append('categoriaId', categoriaId.toString());

        if (params.toString()) {
            url += '?' + params.toString();
        }

        return this.http
            .get<ReporteEnvelope<ReporteCitasPorEstado>>(url)
            .pipe(map((respuesta) => respuesta.data));
    }

    /**
     * Obtener reporte de citas por profesional
     */
    getCitasPorProfesional(
        fechaInicio?: string,
        fechaFin?: string,
        profesionalId?: number
    ): Observable<ReporteCitasPorProfesional[]> {
        let url = `${this.apiUrl}/citas-por-profesional`;
        const params = new URLSearchParams();

        if (fechaInicio) params.append('fechaInicio', fechaInicio);
        if (fechaFin) params.append('fechaFin', fechaFin);
        if (profesionalId) params.append('profesionalId', profesionalId.toString());

        if (params.toString()) {
            url += '?' + params.toString();
        }

        return this.http
            .get<ReporteEnvelope<ReporteCitasPorProfesional[]>>(url)
            .pipe(map((respuesta) => respuesta.data));
    }

    /**
     * Obtener reporte de calificaciones
     */
    getCalificaciones(
        umbralBaja?: number,
        profesionalId?: number
    ): Observable<ReporteCalificaciones[]> {
        let url = `${this.apiUrl}/calificaciones`;
        const params = new URLSearchParams();

        if (umbralBaja) params.append('umbralBaja', umbralBaja.toString());
        if (profesionalId) params.append('profesionalId', profesionalId.toString());

        if (params.toString()) {
            url += '?' + params.toString();
        }

        return this.http
            .get<ReporteEnvelope<ReporteCalificaciones[]>>(url)
            .pipe(map((respuesta) => respuesta.data));
    }
}
